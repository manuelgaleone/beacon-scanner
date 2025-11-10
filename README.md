# Cosmo IBeacon App 📡

Un'app React Native Expo moderna per scansionare beacon Bluetooth e dispositivi BLE nei dintorni.

## ✨ Caratteristiche

- 🔍 Scansione beacon Bluetooth in tempo reale
- 📊 Visualizzazione di UUID, Major, Minor e RSSI
- 🎯 Indicatore di distanza colorato:
  - 🟢 **Verde**: Molto vicino (< 1 metro)
  - 🟡 **Giallo**: Distanza media (1-3 metri)
  - 🔴 **Rosso**: Lontano (> 3 metri)
- 📱 UI moderna e intuitiva
- ⚡ Supporto per iOS e Android
- 🔐 Gestione automatica dei permessi

## 🚀 Installazione

### Prerequisiti

- Node.js (v18 o superiore)
- npm o yarn
- Expo CLI
- Per iOS: Xcode e CocoaPods
- Per Android: Android Studio

### Setup del progetto

```bash
# Installa le dipendenze
npm install

# Per iOS: Installa i pods
npx pod-install

# Genera i file nativi (necessario per react-native-kontaktio)
npx expo prebuild
```

## 📱 Esecuzione

### Development Build (Raccomandato)

Poiché l'app utilizza moduli nativi (`react-native-kontaktio`), è necessario creare una development build:

```bash
# Build per iOS
npx expo run:ios

# Build per Android
npx expo run:android
```

### Build di produzione

```bash
# Build per iOS
eas build --platform ios

# Build per Android
eas build --platform android
```

## 🔧 Configurazione

### Permessi

L'app richiede i seguenti permessi:

#### iOS
- Location (Always e When In Use)
- Bluetooth

#### Android
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- BLUETOOTH
- BLUETOOTH_ADMIN
- BLUETOOTH_SCAN
- BLUETOOTH_CONNECT

Tutti i permessi sono già configurati in `app.json`.

## 📖 Come usare

1. **Avvia l'app**: L'app richiederà automaticamente i permessi necessari
2. **Concedi i permessi**: Accetta i permessi per Location e Bluetooth
3. **Inizia la scansione**: Premi il pulsante "Start Scanning"
4. **Visualizza i beacon**: I beacon trovati appariranno nella lista con tutti i dettagli

## 🎨 Interfaccia

L'app mostra per ogni beacon:
- **Indicatore di distanza**: Cerchio colorato (verde/giallo/rosso)
- **UUID**: Identificatore univoco del beacon
- **Major**: Numero Major del beacon
- **Minor**: Numero Minor del beacon
- **RSSI**: Forza del segnale in dBm
- **Distanza**: Distanza stimata in metri

## 🛠 Tecnologie utilizzate

- **React Native 0.81.5**
- **Expo SDK 54**
- **TypeScript**
- **react-native-kontaktio**: Per la scansione beacon
- **expo-location**: Per i permessi di localizzazione
- **expo-dev-client**: Per supportare moduli nativi

## 📝 Note

- L'app funziona solo su dispositivi reali (non su simulatori/emulatori) perché richiede hardware Bluetooth
- Su Android 12+, sono necessari permessi Bluetooth aggiuntivi (BLUETOOTH_SCAN, BLUETOOTH_CONNECT)
- I beacon vengono aggiornati in tempo reale durante la scansione
- La distanza è calcolata in base al RSSI e potrebbe non essere precisa al 100%

## 🐛 Troubleshooting

### L'app non rileva beacon

1. Verifica che il Bluetooth sia attivo
2. Controlla che i permessi di localizzazione siano concessi
3. Assicurati che i beacon siano accesi e funzionanti
4. Su iOS, verifica che la localizzazione sia impostata su "Always" o "When In Use"

### Errori di build

Se riscontri errori durante il build:

```bash
# Pulisci la cache
npm run clean

# Reinstalla le dipendenze
rm -rf node_modules
npm install

# Ricrea i file nativi
npx expo prebuild --clean
```

## 📄 Licenza

Questo progetto è stato creato per scopi dimostrativi.

## 🤝 Contributi

Contributi, issue e feature request sono benvenuti!

---

Creato con ❤️ usando Expo e React Native

