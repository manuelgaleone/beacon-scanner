# 📋 Informazioni sul Progetto

## 🎯 Descrizione

**Cosmo IBeacon** è un'applicazione React Native Expo di ultima generazione per la scansione e il monitoraggio di beacon Bluetooth (iBeacon). L'app fornisce informazioni dettagliate su ciascun beacon rilevato con un'interfaccia moderna e intuitiva.

## 🛠 Stack Tecnologico

### Framework & Librerie

- **React Native**: 0.81.5 (ultima versione stabile)
- **Expo**: 54.0.23 (SDK più recente)
- **TypeScript**: 5.9.2
- **React**: 19.1.0

### Dipendenze Native

- **react-native-kontaktio**: 4.1.0
  - Libreria per la scansione di beacon Bluetooth
  - Supporta iBeacon e Eddystone
  - API native per iOS e Android

- **expo-location**: 19.0.7
  - Gestione permessi di localizzazione
  - Necessaria per scansione BLE su Android e iOS

- **expo-dev-client**: 6.0.17
  - Supporto per moduli nativi personalizzati
  - Permette di usare librerie che richiedono native code

- **@react-native-async-storage/async-storage**: 2.2.0
  - Storage locale persistente

## 📱 Funzionalità Implementate

### Scansione Beacon

1. **Rilevamento Real-time**: Scansione continua dei beacon nelle vicinanze
2. **Aggiornamento Dinamico**: Lista beacon aggiornata in tempo reale
3. **Gestione Duplicati**: Filtro intelligente per evitare duplicati
4. **Timeout Beacon**: Rimozione automatica di beacon non più rilevati (5 secondi)

### Visualizzazione Dati

Per ogni beacon viene mostrato:

- **UUID**: Identificatore univoco universale
- **Major**: Numero Major (0-65535)
- **Minor**: Numero Minor (0-65535)
- **RSSI**: Potenza del segnale in dBm
- **Distance**: Distanza stimata in metri
- **Proximity**: Prossimità (immediate, near, far, unknown)

### Indicatore di Distanza

Sistema a colori basato su RSSI e accuracy:

- 🟢 **Verde (Very Close)**: < 1 metro o RSSI > -50 dBm
- 🟡 **Giallo (Medium)**: 1-3 metri o RSSI tra -50 e -70 dBm
- 🔴 **Rosso (Far)**: > 3 metri o RSSI < -70 dBm

### Gestione Permessi

- **iOS**:
  - Location Always
  - Location When In Use
  - Bluetooth
  - Background Location

- **Android**:
  - ACCESS_FINE_LOCATION
  - ACCESS_COARSE_LOCATION
  - BLUETOOTH
  - BLUETOOTH_ADMIN
  - BLUETOOTH_SCAN (Android 12+)
  - BLUETOOTH_CONNECT (Android 12+)
  - ACCESS_BACKGROUND_LOCATION

## 🎨 Design & UX

### UI Components

- **SafeAreaView**: Gestione notch e barre di sistema
- **FlatList**: Lista ottimizzata per performance
- **Card Design**: Ogni beacon in una card moderna con ombre
- **Loading States**: Indicatori di caricamento durante operazioni async
- **Empty States**: Messaggi informativi quando nessun beacon è trovato

### Palette Colori

- Background principale: `#F5F7FA`
- Card: `#FFFFFF`
- Testo primario: `#1A1A1A`
- Testo secondario: `#666`
- Successo: `#4CAF50`
- Warning: `#FFC107`
- Errore: `#F44336`
- Primario: `#2196F3`

### Typography

- Titolo: 28px, Bold
- Subtitle: 14px, Regular
- Card Title: 16px, SemiBold
- Label: 12px, Medium
- Value: 13px, Monospace (per UUID)
- Metric: 14px, SemiBold

## 📂 Struttura del Progetto

```
cosmo-ibeacon/
├── ios/                          # Codice nativo iOS (generato)
├── android/                      # Codice nativo Android (generato)
├── assets/                       # Risorse statiche
│   ├── icon.png                 # Icona app
│   ├── adaptive-icon.png        # Icona Android
│   └── splash-icon.png          # Splash screen
├── App.tsx                       # Componente principale
├── index.ts                      # Entry point
├── app.json                      # Configurazione Expo
├── package.json                  # Dipendenze e scripts
├── tsconfig.json                 # Configurazione TypeScript
├── README.md                     # Documentazione completa
├── QUICKSTART.md                 # Guida rapida
└── PROJECT_INFO.md               # Questo file
```

## 🔧 Configurazione Avanzata

### app.json

Configurazioni chiave:

- **newArchEnabled**: `false` (compatibilità con react-native-kontaktio)
- **bundleIdentifier**: `com.beaconscanner.app`
- **package**: `com.beaconscanner.app`
- **plugins**: expo-dev-client, expo-location

### TypeScript

Configurazione strict per type safety:

- Strict mode enabled
- No implicit any
- Strict null checks
- Strict function types

## 📊 Performance

### Ottimizzazioni Implementate

1. **FlatList**: Rendering ottimizzato per liste lunghe
2. **Memo/Callbacks**: Prevenzione re-render non necessari
3. **Event Emitter**: Gestione efficiente degli eventi nativi
4. **Timeout Management**: Rimozione beacon obsoleti

### Considerazioni

- L'app è ottimizzata per scansionare fino a 100 beacon simultaneamente
- Update rate: ~1 secondo per aggiornamento lista
- Memory footprint: ~50-80MB (tipico per app React Native)

## 🧪 Testing

### Requisiti per Test

1. **Dispositivo Reale**: Bluetooth richiede hardware fisico
2. **Beacon Attivi**: Almeno un beacon nelle vicinanze
3. **Permessi**: Tutti i permessi concessi
4. **iOS**: Dispositivo con iOS 13.0+
5. **Android**: Dispositivo con Android 6.0+ (API level 23+)

### Scenari di Test

- ✅ Scansione beacon a diverse distanze
- ✅ Gestione permessi negati
- ✅ Background/foreground transitions
- ✅ Rilevamento multipli beacon
- ✅ Gestione errori Bluetooth disattivato

## 🚀 Deployment

### Development

```bash
# iOS
npm run ios

# Android
npm run android
```

### Production

```bash
# Build usando EAS
eas build --platform ios
eas build --platform android

# O build locale
npm run ios --configuration Release
npm run android --variant release
```

## 📦 Build Sizes (Stime)

- **iOS IPA**: ~80-100 MB
- **Android APK**: ~40-50 MB
- **Android AAB**: ~30-40 MB

## 🔐 Sicurezza

- Nessun dato sensibile viene raccolto
- Tutti i dati beacon rimangono locali
- Nessuna comunicazione con server esterni
- Permessi richiesti solo per funzionalità necessarie

## 🌐 Compatibilità

### iOS

- Minimo: iOS 13.0
- Raccomandato: iOS 15.0+
- Testato: iOS 17.0

### Android

- Minimo: Android 6.0 (API 23)
- Raccomandato: Android 10+ (API 29+)
- Testato: Android 14 (API 34)

## 📈 Future Enhancements

Possibili miglioramenti futuri:

- [ ] Filtri per UUID specifici
- [ ] Grafici della potenza del segnale nel tempo
- [ ] Salvataggio beacon preferiti
- [ ] Export dati in CSV/JSON
- [ ] Background scanning con notifiche
- [ ] Geofencing basato su beacon
- [ ] Supporto Eddystone oltre iBeacon
- [ ] Calibrazione RSSI personalizzata

## 📚 Risorse Utili

- [React Native Kontaktio GitHub](https://github.com/Kontakt-io/react-native-kontaktio)
- [Expo Documentation](https://docs.expo.dev)
- [Beacon Technology Overview](https://kontakt.io/beacon-basics/)
- [iBeacon Specification](https://developer.apple.com/ibeacon/)
- [Android BLE Guide](https://developer.android.com/guide/topics/connectivity/bluetooth/ble-overview)

## 🤝 Supporto

Per domande o problemi:

1. Controlla README.md per documentazione completa
2. Consulta QUICKSTART.md per setup rapido
3. Verifica issues comuni nel troubleshooting

## 📝 Changelog

### Version 1.0.0 (Novembre 2025)

- ✨ Release iniziale
- 📱 Supporto iOS e Android
- 🔍 Scansione beacon real-time
- 🎨 UI moderna con Material Design
- 📊 Visualizzazione completa dati beacon
- 🟢🟡🔴 Indicatori distanza colorati
- 🔐 Gestione permessi completa
- 📖 Documentazione completa

---

**Versione**: 1.0.0  
**Ultima modifica**: Novembre 2025  
**Stato**: Production Ready 🚀

