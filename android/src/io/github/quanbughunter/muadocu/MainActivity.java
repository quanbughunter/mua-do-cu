package io.github.quanbughunter.muadocu;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Soi Đồ Cũ — vỏ Android: WebView chạy trang offline trong assets/www.
 * Trang được phục vụ qua https://appassets.androidplatform.net/ (tên miền ảo, không ra mạng)
 * để là "secure context": camera, micro (getUserMedia) và clipboard chỉ chạy trong secure context.
 */
public class MainActivity extends Activity {
    private static final int REQ_FILE = 5101;
    private static final int REQ_PERM = 5102;
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/www/index.html";

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingPerm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        setContentView(web);
        applyBars();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (u == null || !HOST.equals(u.getHost())) return null;
                return serveAsset(u.getPath());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("https://" + HOST + "/")) return false;
                openExternal(url);
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i;
                try {
                    i = params.createIntent();  // tôn trọng accept="image/*", ".html"…
                } catch (Exception e) {
                    i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                }
                try {
                    startActivityForResult(Intent.createChooser(i, "Chọn tệp"), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest req) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() { handlePermission(req); }
                });
            }
        });

        web.addJavascriptInterface(new Bridge(), "SoiDoCuAndroid");

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START);
    }

    /** Thanh trạng thái / điều hướng cùng màu với app, theo chế độ sáng tối của máy. */
    private void applyBars() {
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        int bar = night ? 0xFF161C27 : 0xFFFFFFFF;
        int bg = night ? 0xFF0E121A : 0xFFEEF1F5;
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        w.setStatusBarColor(bar);
        w.setNavigationBarColor(bg);
        if (web != null) web.setBackgroundColor(bg);
        View decor = w.getDecorView();
        int flags = decor.getSystemUiVisibility();
        int lightStatus = 0x00002000;  // SYSTEM_UI_FLAG_LIGHT_STATUS_BAR (API 23)
        int lightNav = 0x00000010;     // SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR (API 26)
        if (Build.VERSION.SDK_INT >= 23) flags = night ? (flags & ~lightStatus) : (flags | lightStatus);
        if (Build.VERSION.SDK_INT >= 26) flags = night ? (flags & ~lightNav) : (flags | lightNav);
        decor.setSystemUiVisibility(flags);
    }

    private WebResourceResponse serveAsset(String path) {
        if (path == null || path.equals("/")) path = "/www/index.html";
        if (path.endsWith("/")) path += "index.html";
        String name = path.substring(1);
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("Cache-Control", "no-cache");
        try {
            InputStream in = getAssets().open(name);
            String mime = mimeOf(name);
            String enc = mime.startsWith("text/") || mime.endsWith("javascript") || mime.endsWith("json") ? "UTF-8" : null;
            return new WebResourceResponse(mime, enc, 200, "OK", headers, in);
        } catch (Exception e) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", headers,
                    new ByteArrayInputStream(new byte[0]));
        }
    }

    private static String mimeOf(String name) {
        String n = name.toLowerCase();
        if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
        if (n.endsWith(".js")) return "text/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".json") || n.endsWith(".webmanifest")) return "application/json";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    private void openExternal(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(i);
        } catch (Exception e) { /* không có app mở được link */ }
    }

    // ---------- Quyền camera / micro cho getUserMedia ----------
    private void handlePermission(PermissionRequest req) {
        List<String> missing = new ArrayList<String>();
        for (String r : req.getResources()) {
            String p = androidPermission(r);
            if (p != null && Build.VERSION.SDK_INT >= 23 && checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED
                    && !missing.contains(p)) missing.add(p);
        }
        if (missing.isEmpty()) { grantAllowed(req); return; }
        if (pendingPerm != null) pendingPerm.deny();
        pendingPerm = req;
        requestPermissions(missing.toArray(new String[0]), REQ_PERM);
    }

    private static String androidPermission(String resource) {
        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) return android.Manifest.permission.CAMERA;
        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) return android.Manifest.permission.RECORD_AUDIO;
        return null;
    }

    private void grantAllowed(PermissionRequest req) {
        List<String> ok = new ArrayList<String>();
        for (String r : req.getResources()) {
            String p = androidPermission(r);
            if (p == null) continue;  // chỉ cấp camera / micro
            if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED) ok.add(r);
        }
        if (ok.isEmpty()) req.deny();
        else req.grant(ok.toArray(new String[0]));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == REQ_PERM && pendingPerm != null) {
            PermissionRequest req = pendingPerm;
            pendingPerm = null;
            grantAllowed(req);
            return;
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && fileCallback != null) {
            Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            if (result == null && resultCode == RESULT_OK && data != null && data.getData() != null)
                result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    public void onBackPressed() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("(window.__back && window.__back()) ? 'y' : 'n'", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (!"\"y\"".equals(value)) finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    /** Cầu nối gọi từ JavaScript: window.SoiDoCuAndroid */
    private class Bridge {
        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("Soi Đồ Cũ", text));
                }
            });
        }

        @JavascriptInterface
        public String version() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "";
            }
        }
    }
}
