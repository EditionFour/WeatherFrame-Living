<?php

define('PHOTO_DIRECTORY', __DIR__ . '/assets/photos/custom');
define('PHOTO_MANIFEST', PHOTO_DIRECTORY . '/manifest.json');
define('MAX_FILE_SIZE', 12 * 1024 * 1024);

function jsonResponse($status, $payload) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function loadManifest() {
    if (!is_file(PHOTO_MANIFEST)) {
        return array('version' => 1, 'images' => array());
    }

    $data = json_decode(file_get_contents(PHOTO_MANIFEST), true);
    if (!is_array($data) || !isset($data['images']) || !is_array($data['images'])) {
        return array('version' => 1, 'images' => array());
    }

    return $data;
}

function saveManifest($manifest) {
    $temporary = PHOTO_MANIFEST . '.tmp';
    $json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($temporary, $json, LOCK_EX) === false) {
        return false;
    }
    return rename($temporary, PHOTO_MANIFEST);
}

function passwordIsValid($password) {
    $config = __DIR__ . '/upload-config.php';
    if (!is_file($config)) return false;
    require $config;
    $candidate = hash('sha256', UPLOAD_PASSWORD_SALT . $password);
    return hash_equals(UPLOAD_PASSWORD_HASH, $candidate);
}

function randomFilename($extension) {
    $bytes = function_exists('openssl_random_pseudo_bytes') ? openssl_random_pseudo_bytes(12) : false;
    $token = $bytes !== false ? bin2hex($bytes) : str_replace('.', '', uniqid('', true));
    return gmdate('Ymd-His') . '-' . $token . '.' . $extension;
}

function normalizedFiles($files) {
    $result = array();
    if (!isset($files['name']) || !is_array($files['name'])) return $result;
    foreach ($files['name'] as $index => $name) {
        $result[] = array(
            'name' => $name,
            'type' => isset($files['type'][$index]) ? $files['type'][$index] : '',
            'tmp_name' => isset($files['tmp_name'][$index]) ? $files['tmp_name'][$index] : '',
            'error' => isset($files['error'][$index]) ? $files['error'][$index] : UPLOAD_ERR_NO_FILE,
            'size' => isset($files['size'][$index]) ? $files['size'][$index] : 0
        );
    }
    return $result;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!passwordIsValid(isset($_POST['password']) ? (string) $_POST['password'] : '')) {
        jsonResponse(401, array('ok' => false, 'message' => 'Passwort nicht korrekt.'));
    }

    if (!is_dir(PHOTO_DIRECTORY) && !mkdir(PHOTO_DIRECTORY, 0755, true)) {
        jsonResponse(500, array('ok' => false, 'message' => 'Der Fotoordner konnte nicht angelegt werden.'));
    }

    $action = isset($_POST['action']) ? $_POST['action'] : 'upload';
    $manifest = loadManifest();

    if ($action === 'delete') {
        $requested = isset($_POST['file']) ? (string) $_POST['file'] : '';
        $kept = array();
        $deleted = false;
        foreach ($manifest['images'] as $image) {
            if (!$deleted && isset($image['file']) && $image['file'] === $requested) {
                $absolute = __DIR__ . '/' . $image['file'];
                if (is_file($absolute)) unlink($absolute);
                $deleted = true;
            } else {
                $kept[] = $image;
            }
        }
        if (!$deleted) jsonResponse(404, array('ok' => false, 'message' => 'Bild nicht gefunden.'));
        $manifest['images'] = $kept;
        if (!saveManifest($manifest)) jsonResponse(500, array('ok' => false, 'message' => 'Manifest konnte nicht gespeichert werden.'));
        jsonResponse(200, array('ok' => true, 'message' => 'Bild gelöscht.'));
    }

    $allowedTags = array(
        'season' => array('any', 'spring', 'summer', 'autumn', 'winter'),
        'daytime' => array('any', 'morning', 'midday', 'evening', 'night'),
        'weather' => array('any', 'clear', 'cloudy', 'rain', 'snow', 'fog', 'storm')
    );
    $tags = array();
    foreach ($allowedTags as $key => $values) {
        $value = isset($_POST[$key]) ? $_POST[$key] : 'any';
        $tags[$key] = in_array($value, $values, true) ? $value : 'any';
    }

    $mimeTypes = array('image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp');
    $files = isset($_FILES['photos']) ? normalizedFiles($_FILES['photos']) : array();
    if (count($files) === 0) jsonResponse(400, array('ok' => false, 'message' => 'Bitte mindestens ein Bild auswählen.'));
    if (count($files) > 12) jsonResponse(400, array('ok' => false, 'message' => 'Maximal 12 Bilder pro Upload.'));

    $added = array();
    $errors = array();
    foreach ($files as $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $file['name'] . ': Upload fehlgeschlagen.';
            continue;
        }
        if ($file['size'] < 1 || $file['size'] > MAX_FILE_SIZE) {
            $errors[] = $file['name'] . ': maximal 12 MB erlaubt.';
            continue;
        }
        $imageInfo = @getimagesize($file['tmp_name']);
        $mime = $imageInfo && isset($imageInfo['mime']) ? $imageInfo['mime'] : '';
        if (!isset($mimeTypes[$mime])) {
            $errors[] = $file['name'] . ': nur JPEG, PNG oder WebP erlaubt.';
            continue;
        }
        if ($imageInfo[0] < 1280 || $imageInfo[1] < 720) {
            $errors[] = $file['name'] . ': mindestens 1280 × 720 Pixel erforderlich.';
            continue;
        }

        $filename = randomFilename($mimeTypes[$mime]);
        $destination = PHOTO_DIRECTORY . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            $errors[] = $file['name'] . ': Datei konnte nicht gespeichert werden.';
            continue;
        }

        $entry = array(
            'file' => 'assets/photos/custom/' . $filename,
            'season' => $tags['season'],
            'daytime' => $tags['daytime'],
            'weather' => $tags['weather'],
            'width' => $imageInfo[0],
            'height' => $imageInfo[1],
            'createdAt' => gmdate('c')
        );
        $manifest['images'][] = $entry;
        $added[] = $destination;
    }

    if (count($added) === 0) jsonResponse(400, array('ok' => false, 'message' => implode(' ', $errors)));
    if (!saveManifest($manifest)) {
        foreach ($added as $file) if (is_file($file)) unlink($file);
        jsonResponse(500, array('ok' => false, 'message' => 'Manifest konnte nicht gespeichert werden.'));
    }

    $message = count($added) . ' Bild' . (count($added) === 1 ? '' : 'er') . ' gespeichert.';
    if (count($errors)) $message .= ' Hinweise: ' . implode(' ', $errors);
    jsonResponse(200, array('ok' => true, 'message' => $message));
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>WeatherFrame Fotoverwaltung</title>
  <style>
    :root{color-scheme:dark;--bg:#0c171d;--card:#17272e;--line:#36505a;--accent:#7dd3fc;--text:#f6f8f9;--soft:#aebdc4}
    *{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#091217,#14262d);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}
    main{width:min(980px,calc(100% - 32px));margin:40px auto}.top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}h1{margin:0;font-size:clamp(28px,5vw,44px)}.top p{margin:8px 0 0;color:var(--soft)}a{color:var(--accent)}
    .panel{background:rgba(23,39,46,.9);border:1px solid var(--line);border-radius:20px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.25)}form{display:grid;gap:18px}.fields{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}label{display:grid;gap:7px;color:var(--soft);font-size:14px}input,select,button{width:100%;border:1px solid var(--line);border-radius:12px;background:#0e1c22;color:var(--text);padding:13px;font:inherit}input[type=file]{padding:20px}button{cursor:pointer;background:#dff6ff;color:#06202c;border:0;font-weight:700}button:disabled{opacity:.55;cursor:wait}.hint{color:var(--soft);font-size:13px;line-height:1.5}.status{min-height:24px;margin:16px 0;color:var(--accent)}
    .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}.photo{overflow:hidden;border:1px solid var(--line);border-radius:15px;background:#0d1b21}.photo img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.meta{padding:12px;font-size:13px;color:var(--soft)}.meta strong{display:block;color:var(--text);margin-bottom:5px}.delete{margin-top:10px;padding:9px;background:#51252a;color:#ffd9dd}.empty{color:var(--soft)}
    @media(max-width:700px){main{margin:20px auto}.top{display:block}.fields,.gallery{grid-template-columns:1fr}.panel{padding:18px}}
  </style>
</head>
<body>
<main>
  <div class="top"><div><h1>Eigene Wetterfotos</h1><p>Fotos hochladen, einordnen und für WeatherFrame Living verwenden.</p></div><a href="./">Zum Dashboard</a></div>
  <section class="panel">
    <form id="uploadForm" enctype="multipart/form-data">
      <label>Passwort<input id="password" name="password" type="password" autocomplete="current-password" required></label>
      <label>Fotos<input name="photos[]" type="file" accept="image/jpeg,image/png,image/webp" multiple required></label>
      <div class="fields">
        <label>Jahreszeit<select name="season"><option value="any">Alle</option><option value="spring">Frühling</option><option value="summer">Sommer</option><option value="autumn">Herbst</option><option value="winter">Winter</option></select></label>
        <label>Tageszeit<select name="daytime"><option value="any">Alle</option><option value="morning">Morgens</option><option value="midday">Mittags</option><option value="evening">Abends</option><option value="night">Nachts</option></select></label>
        <label>Wetter<select name="weather"><option value="any">Alle</option><option value="clear">Sonne / klar</option><option value="cloudy">Bewölkt</option><option value="rain">Regen</option><option value="snow">Schnee</option><option value="fog">Nebel</option><option value="storm">Gewitter</option></select></label>
      </div>
      <p class="hint">JPEG, PNG oder WebP · mindestens 1280 × 720 Pixel · maximal 12 MB pro Bild · maximal 12 Bilder pro Vorgang. Querformat funktioniert am besten.</p>
      <button type="submit">Bilder hochladen</button>
    </form>
    <p id="status" class="status" role="status"></p>
    <h2>Hochgeladene Bilder</h2>
    <div id="gallery" class="gallery"><p class="empty">Noch keine eigenen Bilder vorhanden.</p></div>
  </section>
</main>
<script>
  const form = document.getElementById('uploadForm');
  const status = document.getElementById('status');
  const gallery = document.getElementById('gallery');

  async function request(formData) {
    const response = await fetch('upload.php', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Anfrage fehlgeschlagen.');
    return data;
  }

  async function loadGallery() {
    try {
      const response = await fetch('assets/photos/custom/manifest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const manifest = await response.json();
      gallery.replaceChildren();
      if (!manifest.images || manifest.images.length === 0) throw new Error();
      manifest.images.slice().reverse().forEach(image => {
        const card = document.createElement('article');
        card.className = 'photo';
        card.innerHTML = `<img src="${image.file}" alt="Eigenes Hintergrundfoto"><div class="meta"><strong>${image.season} · ${image.daytime} · ${image.weather}</strong>${image.width} × ${image.height}<button class="delete" type="button">Löschen</button></div>`;
        card.querySelector('button').addEventListener('click', () => deletePhoto(image.file));
        gallery.appendChild(card);
      });
    } catch (error) {
      gallery.innerHTML = '<p class="empty">Noch keine eigenen Bilder vorhanden.</p>';
    }
  }

  async function deletePhoto(file) {
    if (!confirm('Dieses Bild wirklich löschen?')) return;
    const data = new FormData();
    data.set('action', 'delete');
    data.set('password', document.getElementById('password').value);
    data.set('file', file);
    try {
      status.textContent = (await request(data)).message;
      await loadGallery();
    } catch (error) { status.textContent = error.message; }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type=submit]');
    button.disabled = true;
    status.textContent = 'Upload läuft …';
    try {
      status.textContent = (await request(new FormData(form))).message;
      form.querySelector('input[type=file]').value = '';
      await loadGallery();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });

  loadGallery();
</script>
</body>
</html>
