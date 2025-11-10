# Risoluzione Problema Bitcode in KontaktSDK

## Problema

Quando si carica l'app su App Store Connect, si riceve l'errore:

```
Validation failed (409)
Invalid Executable. The executable 'cosmoibeacon.app/Frameworks/KontaktSDK.framework/KontaktSDK' 
contains bitcode.
```

Questo accade perché:
- Apple ha deprecato il bitcode da Xcode 14
- App Store Connect non accetta più app che contengono bitcode
- Il framework `KontaktSDK` (usato da `react-native-kontaktio`) contiene bitcode pre-compilato

## Soluzione Implementata

### 1. Script Automatico di Rimozione Bitcode

È stato creato lo script `scripts/strip-bitcode.sh` che:
- Controlla se il framework KontaktSDK contiene bitcode
- Rimuove il bitcode usando `xcrun bitcode_strip` (usando un file temporale in `/tmp`)
- Rimuove eventuali file `.backup` per evitare errori di validazione
- Viene eseguito automaticamente dopo ogni `npm install` (tramite hook `postinstall`)

**IMPORTANTE**: Lo script **non crea più backup** nel framework per evitare che file `.backup` vengano inclusi nell'app finale e causino errori di validazione su App Store Connect.

### 2. Configurazione Podfile

Il `Podfile` è stato aggiornato per:
- Disabilitare `ENABLE_BITCODE` per tutti i target dei Pods
- Disabilitare specificamente il bitcode per il target `KontaktBeacons`
- **Rimuovere automaticamente tutti i file `.backup`** durante `pod install` per evitare errori di validazione

### 3. Script Pre-Build Cleanup

È stato aggiunto lo script `scripts/pre-build-cleanup.sh` che:
- Rimuove tutti i file `.backup` prima della build
- Verifica che il KontaktSDK non contenga bitcode
- Può essere eseguito manualmente se necessario

### 3. Configurazione Xcode

Il progetto Xcode ha già `ENABLE_BITCODE = NO` nella configurazione, ma questo non è sufficiente perché il framework pre-compilato contiene già bitcode.

## Verifica della Rimozione Bitcode

Per verificare se il bitcode è presente in un framework:

```bash
otool -l node_modules/react-native-kontaktio/ios/KontaktSDK.framework/KontaktSDK | grep __LLVM
```

- **Se trova segmenti `__LLVM`**: il bitcode è presente
- **Se non trova nulla**: il bitcode è stato rimosso

## Dimensioni del File

- **Con bitcode**: ~12 MB
- **Senza bitcode**: ~2 MB

## Errori di Validazione su App Store Connect

### Errore: "Invalid Executable - contains bitcode"

Se ricevi questo errore anche dopo aver seguito i passaggi sopra:

1. **Verifica che non ci siano file `.backup`**:
   ```bash
   find . -name "*.backup" -type f
   ```
   Se ne trovi, eliminali:
   ```bash
   find . -name "*.backup" -type f -delete
   ```

2. **Pulisci completamente e rigenera**:
   ```bash
   cd ios
   rm -rf build Pods Podfile.lock
   pod install
   ```

3. **Fai una Clean Build in Xcode**:
   - Apri il progetto in Xcode
   - Product → Clean Build Folder (Cmd+Shift+K)
   - Archivia nuovamente

### Errore: "Invalid bundle structure - .backup binary file not permitted"

Questo errore indica che un file `.backup` è stato incluso nell'app. Il Podfile ora rimuove automaticamente questi file, ma se l'errore persiste:

1. **Rimuovi manualmente i file .backup**:
   ```bash
   cd /path/to/project
   find node_modules -name "*.backup" -delete
   ```

2. **Reinstalla i Pods**:
   ```bash
   cd ios
   pod install
   ```

3. **Verifica nel bundle prima di uploadare**:
   ```bash
   # Dopo aver creato l'archivio, verifica
   cd ~/Library/Developer/Xcode/Archives/...
   find . -name "*.backup"
   ```

## Cosa Fare in Caso di Problemi

### Se l'errore persiste dopo la build:

1. **Verifica che lo script sia stato eseguito**:
   ```bash
   npm run postinstall
   # oppure direttamente:
   ./scripts/strip-bitcode.sh
   ```

2. **Verifica manualmente il bitcode**:
   ```bash
   otool -l node_modules/react-native-kontaktio/ios/KontaktSDK.framework/KontaktSDK | grep __LLVM
   ```

3. **Reinstalla i CocoaPods**:
   ```bash
   cd ios
   pod install
   ```

4. **Pulisci la build di Xcode**:
   - Apri il progetto in Xcode
   - Product → Clean Build Folder (Cmd+Shift+K)
   - Chiudi Xcode
   - Elimina `ios/build/` se esiste

5. **Per build EAS**, assicurati che:
   - Lo script `postinstall` venga eseguito durante la build
   - Il framework sia stato correttamente modificato prima della build

### Se devi reinstallare le dipendenze:

```bash
rm -rf node_modules
npm install
```

Lo script `postinstall` rimuoverà automaticamente il bitcode.

## File Modificati

1. `scripts/strip-bitcode.sh` - Script di rimozione bitcode (aggiornato per non creare file .backup)
2. `scripts/pre-build-cleanup.sh` - Script di pulizia pre-build (nuovo)
3. `package.json` - Aggiunto hook `postinstall`
4. `ios/Podfile` - Configurazione per disabilitare bitcode + rimozione file .backup
5. `eas.json` - Configurazione build iOS

## Riferimenti

- [Apple Developer Documentation - Bitcode](https://developer.apple.com/documentation/xcode/bitcode)
- [React Native iOS Build Issues](https://reactnative.dev/docs/building-for-apple-devices)

