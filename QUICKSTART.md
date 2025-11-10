# 🚀 Quick Start Guide

## Setup Rapido (5 minuti)

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Genera i file nativi (già fatto se vedi le cartelle `ios/` e `android/`)
```bash
npm run prebuild
```

### 3. Esegui l'app

#### iOS (richiede Mac con Xcode)
```bash
npm run ios
```

#### Android (richiede Android Studio e device/emulatore configurato)
```bash
npm run android
```

## 📱 Test su dispositivo reale

**IMPORTANTE**: L'app funziona SOLO su dispositivi reali con Bluetooth!

### iOS - Test su iPhone

1. Collega l'iPhone al Mac
2. Apri Xcode e seleziona il dispositivo
3. Esegui:
```bash
npm run ios
```

### Android - Test su dispositivo

1. Abilita "Modalità sviluppatore" e "Debug USB" sul dispositivo
2. Collega il dispositivo al computer
3. Verifica che sia collegato:
```bash
adb devices
```
4. Esegui:
```bash
npm run android
```

## 🔧 Comandi Utili

```bash
# Avvia development server
npm start

# Pulisci e ricrea tutto
npm run clean

# Ricrea solo i file nativi
npm run prebuild:clean

# Development build specifici
npm run dev:ios
npm run dev:android
```

## ✅ Checklist Pre-Test

- [ ] Bluetooth attivo sul dispositivo
- [ ] Permessi di localizzazione concessi
- [ ] Beacon Bluetooth accesi e funzionanti nelle vicinanze
- [ ] App installata su dispositivo reale (no simulatore)

## 🐛 Problemi Comuni

### L'app non si compila

```bash
# Pulisci tutto e ricomincia
npm run clean
```

### I beacon non vengono rilevati

1. ✅ Verifica che il Bluetooth sia attivo
2. ✅ Controlla i permessi nelle impostazioni del dispositivo
3. ✅ Assicurati che i beacon siano accesi
4. ✅ Su Android 12+, verifica i permessi Bluetooth nelle impostazioni

### Errori con CocoaPods (iOS)

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## 📊 Interpretazione dei Dati

### Colori Indicatore
- 🟢 **Verde**: Beacon molto vicino (< 1 metro) - RSSI > -50 dBm
- 🟡 **Giallo**: Distanza media (1-3 metri) - RSSI tra -50 e -70 dBm
- 🔴 **Rosso**: Beacon lontano (> 3 metri) - RSSI < -70 dBm

### RSSI (Received Signal Strength Indicator)
- Misurato in dBm (decibel-milliwatt)
- Valori più alti = più vicino
- Range tipico: da -30 (molto vicino) a -100 (molto lontano)

### Major e Minor
- **Major**: Identifica un gruppo di beacon (es. piano di un edificio)
- **Minor**: Identifica un beacon specifico (es. stanza specifica)

### UUID
- Identificatore univoco del beacon
- Solitamente identifica un'organizzazione o una app

## 💡 Tips

1. **Test in ambiente aperto**: I beacon funzionano meglio senza ostacoli
2. **Calibrazione**: La distanza è una stima basata sul RSSI
3. **Batterie dei beacon**: Beacon con batterie scariche hanno RSSI più basso
4. **Interferenze**: WiFi e altri dispositivi Bluetooth possono interferire

## 🔗 Link Utili

- [React Native Kontaktio Docs](https://github.com/Kontakt-io/react-native-kontaktio)
- [Expo Documentation](https://docs.expo.dev)
- [Beacon Technology Guide](https://kontakt.io/beacon-basics/)

---

Buon divertimento con l'app! 🎉

