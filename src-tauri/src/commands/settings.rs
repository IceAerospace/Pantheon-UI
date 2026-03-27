use serde::{Deserialize, Serialize};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub nats_url: String,
    pub service_id: String,
    pub theme: String,
    pub language: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            nats_url: "ws://localhost:4222".to_string(),
            service_id: "default".to_string(),
            theme: "system".to_string(),
            language: "en".to_string(),
        }
    }
}

/// Read application settings from the persistent store.
#[tauri::command]
pub fn get_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let settings = match store.get("app_settings") {
        Some(value) => serde_json::from_value::<AppSettings>(value)
            .unwrap_or_default(),
        None => AppSettings::default(),
    };
    Ok(settings)
}

/// Persist application settings to the store.
#[tauri::command]
pub fn save_settings(
    app: tauri::AppHandle,
    settings: AppSettings,
) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let value = serde_json::to_value(&settings).map_err(|e| e.to_string())?;
    store.set("app_settings", value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
