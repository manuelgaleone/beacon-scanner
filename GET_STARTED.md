# 🎉 Inizia Subito!

Il tuo progetto **Cosmo IBeacon** è pronto! Segui questi passaggi per vedere l'app in azione.

## ⚡ Quick Start (3 passaggi)

### 1️⃣ Verifica che tutto sia installato

Le dipendenze sono già installate e i file nativi sono stati generati. Dovresti vedere le cartelle `ios/` e `android/`.

```bash
cd cosmo-ibeacon
ls -la  # Verifica la presenza di ios/ e android/
```

### 2️⃣ Avvia l'app su iOS

```bash
npm run ios
```

Questo:
- Avvierà il Metro Bundler
- Compilerà l'app per iOS
- Lancerà l'app nel simulatore iOS (o su dispositivo se connesso)

### 3️⃣ Oppure avvia l'app su Android

```bash
npm run android
```

Questo:
- Avvierà il Metro Bundler
- Compilerà l'app per Android
- Installerà l'app su emulatore o dispositivo connesso

## ⚠️ IMPORTANTE per il Test

### L'app funziona SOLO su dispositivi reali!

I simulatori/emulatori non supportano Bluetooth. Per testare:

#### 📱 iOS (iPhone/iPad reale)

1. Collega l'iPhone al Mac con il cavo
2. Sblocca il dispositivo e autorizza il computer
3. Esegui:
```bash
npm run ios
```
4. Xcode aprirà automaticamente e potrai selezionare il dispositivo

#### 🤖 Android (dispositivo reale)

1. Abilita "Opzioni sviluppatore" sul dispositivo:
   - Vai in Impostazioni > Info telefono
   - Tocca 7 volte su "Numero build"
   - Torna indietro e apri "Opzioni sviluppatore"
   - Abilita "Debug USB"

2. Collega il dispositivo con cavo USB

3. Verifica che sia riconosciuto:
```bash
adb devices
```

4. Esegui l'app:
```bash
npm run android
```

## 🔍 Come Usare l'App

1. **Avvia l'app** - L'app si aprirà e chiederà i permessi
2. **Concedi permessi** - Accetta Location e Bluetooth
3. **Premi "Start Scanning"** - Inizierà la scansione
4. **Avvicina un beacon** - Vedrai apparire i beacon nella lista

## 📊 Cosa Vedrai

Per ogni beacon rilevato:

```
🟢 Very Close               (se < 1 metro)
🟡 Medium                   (se 1-3 metri)
🔴 Far                      (se > 3 metri)

UUID: F7826DA6-4FA2-4E98-8024-BC5B71E0893E
Major: 1234
Minor: 5678
RSSI: -65 dBm
Distance: 2.45m
```

## 🧪 Test senza Beacon Fisici

Se non hai beacon fisici, puoi:

### Opzione 1: Usa un altro smartphone come beacon

Installa un'app beacon simulator:
- iOS: "Beacon Simulator" (App Store)
- Android: "Beacon Simulator" (Play Store)

### Opzione 2: Usa un Raspberry Pi

Configura un Raspberry Pi come beacon iBeacon

### Opzione 3: Acquista beacon economici

Beacon economici su Amazon (~€10-20):
- Kontakt.io
- Estimote
- RadBeacon

## 🛠 Comandi Utili

```bash
# Riavvia tutto
npm start

# Vedi i log
npm start -- --no-clear

# Pulisci e ricompila (se hai problemi)
npm run clean

# Solo per iOS: reinstalla pods
cd ios && pod install && cd ..

# Solo per Android: pulisci build
cd android && ./gradlew clean && cd ..
```

## 🎨 Personalizzazioni Rapide

### Cambia i colori dell'indicatore di distanza

Apri `App.tsx` e modifica la funzione `getDistanceColor`:

```typescript
const getDistanceColor = (rssi: number, accuracy: number) => {
  if (accuracy < 1 || rssi > -50) {
    return '#4CAF50'; // 🟢 Cambia questo per il verde
  } else if (accuracy < 3 || rssi > -70) {
    return '#FFC107'; // 🟡 Cambia questo per il giallo
  } else {
    return '#F44336'; // 🔴 Cambia questo per il rosso
  }
};
```

### Modifica le soglie di distanza

Cambia i valori di `accuracy`:

```typescript
// Esempio: più sensibile
if (accuracy < 0.5 || rssi > -45) {  // Originale: < 1, > -50
  return '#4CAF50';
}
```

## 📱 Build per Distribuzione

### iOS (richiede Apple Developer Account)

```bash
# Con EAS Build (consigliato)
npm install -g eas-cli
eas build --platform ios

# O con Xcode
open ios/beaconscanner.xcworkspace
# Poi: Product > Archive
```

### Android

```bash
# Con EAS Build (consigliato)
eas build --platform android

# O manualmente
cd android
./gradlew assembleRelease
# APK in: android/app/build/outputs/apk/release/
```

## 🐛 Problemi Comuni

### Errore: "Command not found"

```bash
# Assicurati di essere nella cartella corretta
cd /Users/manuelgaleone/Lavoro/CosmoStudio/ArtPlace/Repositories/test-kontakt/cosmo-ibeacon

# Reinstalla se necessario
npm install
```

### Errore: "No devices found"

```bash
# iOS
xcrun simctl list devices

# Android
adb devices
```

### L'app si apre ma non trova beacon

1. ✅ Bluetooth attivo?
2. ✅ Permessi concessi?
3. ✅ Beacon accesi nelle vicinanze?
4. ✅ Su dispositivo reale (non simulatore)?

### Crash all'avvio

```bash
# Ricompila tutto
npm run prebuild:clean
npm run ios  # o npm run android
```

## 📚 Documentazione Completa

- `README.md` - Documentazione completa
- `PROJECT_INFO.md` - Dettagli tecnici
- `QUICKSTART.md` - Guida rapida setup

## 🎯 Prossimi Passi

1. ✅ Testa l'app su dispositivo reale
2. ✅ Prova con diversi beacon
3. ✅ Sperimenta con le distanze
4. 🔧 Personalizza l'interfaccia
5. 🚀 Aggiungi nuove funzionalità

## 💪 Sei Pronto!

Il progetto è completo e funzionante. Ora puoi:

- 🧪 **Testare** l'app su dispositivi reali
- 🎨 **Personalizzare** l'interfaccia
- 🔧 **Modificare** la logica di scansione
- 📊 **Aggiungere** nuove feature
- 🚀 **Distribuire** l'app

---

## 🆘 Serve Aiuto?

Se incontri problemi:

1. Controlla i file di documentazione
2. Verifica di essere su dispositivo reale
3. Assicurati che tutti i permessi siano concessi
4. Prova a ricompilare con `npm run clean`

**Buon divertimento con il tuo Cosmo IBeacon!** 🎉

---

Creato con ❤️ - Novembre 2025

