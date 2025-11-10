# Configurazione Beacon

## Come funziona l'app

L'app supporta la scansione di beacon sia su iOS che Android, con comportamenti leggermente diversi per ciascuna piattaforma.

### Android

Su Android, l'app:
- Usa `connect()` per inizializzare l'SDK Kontakt
- Usa `startScanning()` per scansionare **tutti i beacon** nelle vicinanze
- Ascolta l'evento `beaconsDidUpdate` tramite `DeviceEventEmitter`
- **Non richiede configurazione UUID** - rileva automaticamente tutti i beacon

### iOS

Su iOS, l'app:
- Usa `init()` per inizializzare l'SDK Kontakt
- Usa `startDiscovery()` per rilevare **TUTTI i beacon Kontakt.io** nelle vicinanze
- Ascolta l'evento `didDiscoverDevices` (tramite `NativeEventEmitter`)
- **Non richiede configurazione UUID** - rileva automaticamente tutti i beacon Kontakt.io

**Nota**: Se hai beacon NON Kontakt.io, dovrai aggiungere manualmente `startRangingBeaconsInRegion()` con l'UUID specifico (vedi sezione avanzata sotto).

## Configurazione Base (Attuale)

L'app è attualmente configurata per rilevare:
- **Android**: TUTTI i beacon senza filtri UUID
- **iOS**: Beacon delle seguenti marche (UUID più comuni):
  - Kontakt.io
  - Estimote
  - Apple AirLocate
  - RadBeacon (Radius Networks)
  - Radius Networks
  - BlueUp

Questo significa che l'app rileverà automaticamente la maggior parte dei beacon commerciali senza bisogno di configurazione aggiuntiva.

### Aggiungere UUID personalizzati

Se hai beacon con UUID diversi da quelli predefiniti, puoi aggiungerli facilmente modificando l'array `COMMON_BEACON_UUIDS` all'inizio del file `App.tsx` (circa linea 35):

```typescript
const COMMON_BEACON_UUIDS = [
  { identifier: 'Kontakt', uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' },
  // ... altri UUID ...
  // Aggiungi il tuo UUID qui:
  { identifier: 'MioBeacon', uuid: 'IL-TUO-UUID-QUI' },
];
```

## Configurazione Avanzata - Aggiungere filtro UUID per beacon non-Kontakt.io (iOS)

Se hai beacon **NON Kontakt.io** su iOS e vuoi rilevarli, devi aggiungere manualmente il filtro UUID.

### Come aggiungere un filtro UUID su iOS

Modifica il file `App.tsx`, nella funzione `startBeaconScanning()`:

1. Trova la sezione iOS (circa linea 183)
2. Aggiungi `startRangingBeaconsInRegion()` dopo `startDiscovery()`:

```typescript
} else {
  // iOS - start discovery for ALL Kontakt.io beacons (no UUID filter)
  await startDiscovery();
  
  // Aggiungi questo per beacon con UUID personalizzato:
  await startRangingBeaconsInRegion({
    identifier: 'MyCustomBeacons',
    uuid: 'IL-TUO-UUID-QUI', // <-- Sostituisci con il tuo UUID
  });
  
  // iOS event listeners
  kontaktEmitter.addListener('didDiscoverDevices', ({ beacons: discoveredBeacons }: any) => {
    console.log('iOS didDiscoverDevices:', discoveredBeacons?.length, discoveredBeacons);
    if (discoveredBeacons && discoveredBeacons.length > 0) {
      updateBeaconsList(discoveredBeacons);
    }
  });
  
  // Aggiungi anche questo listener per didRangeBeacons:
  kontaktEmitter.addListener('didRangeBeacons', ({ beacons: discoveredBeacons, region }: any) => {
    console.log('iOS didRangeBeacons:', discoveredBeacons?.length);
    if (discoveredBeacons && discoveredBeacons.length > 0) {
      updateBeaconsList(discoveredBeacons);
    }
  });
  
  console.log('iOS scanning started - looking for all beacons');
}
```

3. Nella funzione `stopBeaconScanning()` (circa linea 239), aggiungi anche:

```typescript
} else {
  await stopDiscovery();
  
  // Aggiungi questo:
  await stopRangingBeaconsInRegion({
    identifier: 'MyCustomBeacons',
    uuid: 'IL-TUO-UUID-QUI', // <-- Lo stesso UUID di sopra
  });
  
  kontaktEmitter.removeAllListeners('didDiscoverDevices');
  // Aggiungi anche:
  kontaktEmitter.removeAllListeners('didRangeBeacons');
}
```

### Scansione di più UUID contemporaneamente (iOS)

Se vuoi scansionare beacon con UUID diversi, puoi chiamare `startRangingBeaconsInRegion()` più volte con UUID diversi:

```typescript
// Beacon Kontakt.io
await startRangingBeaconsInRegion({
  identifier: 'KontaktRegion',
  uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
});

// I tuoi beacon personalizzati
await startRangingBeaconsInRegion({
  identifier: 'MyBeaconRegion',
  uuid: 'A4826DE4-1EA9-4E47-8321-CB7A61E4667E',
});
```

Ricorda di fermare entrambe le regioni quando stoppi la scansione.

### Filtrare per Major e Minor (Opzionale)

Puoi anche filtrare per specifici valori Major e Minor:

```typescript
await startRangingBeaconsInRegion({
  identifier: 'SpecificBeacon',
  uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
  major: 1,      // Opzionale
  minor: 34,     // Opzionale
});
```

## UUID Comuni

### Kontakt.io
```
f7826da6-4fa2-4e98-8024-bc5b71e0893e
```

### Estimote
```
B9407F30-F5F8-466E-AFF9-25556B57FE6D
```

### BlueUp
```
ACFD065E-C3C0-11E3-9BBE-1A514932AC01
```

**Nota importante per beacon BlueUp**: 
- I beacon BlueUp supportano sia iBeacon che Eddystone
- L'UUID sopra è quello **standard/predefinito** di fabbrica
- I beacon BlueUp possono essere **riconfigurati con UUID personalizzati** tramite l'app BlueBeacon Manager
- Se i tuoi beacon BlueUp non vengono rilevati, potrebbero avere un UUID personalizzato configurato
- Per verificare/modificare l'UUID: usa l'app [BlueBeacon Manager](https://docs.blueupbeacons.com/BLE/Beacons/BlueBeacon_Manager_App/) (Android/iOS)
- Documentazione completa: [BlueUp Beacons Documentation](https://docs.blueupbeacons.com/BLE/Beacons/BlueBeacon_Advertising_Packets_Format/#ibeacon)

### Apple AirLocate
```
E2C56DB5-DFFB-48D2-B060-D0F5A71096E0
```

## Test dell'App

### Con beacon fisici
1. Accendi i tuoi beacon
2. Avvia l'app
3. Tocca "Start Scanning"
4. I beacon dovrebbero apparire nella lista

### Con beacon virtuali (iOS)
Puoi usare app come [Beacon Simulator](https://apps.apple.com/us/app/beacon-simulator/id1051608999) per simulare beacon.

### Con beacon virtuali (Android)
Puoi usare app come [Beacon Simulator](https://play.google.com/store/apps/details?id=net.alea.beaconsimulator) per simulare beacon.

### Con MacOS (solo per test iOS)
Puoi usare [MactsAsBeacon](https://github.com/timd/MactsAsBeacon) per trasformare il tuo Mac in un beacon.

## Permessi Richiesti

### iOS
- Location Always and When In Use
- Location When In Use
- Bluetooth (automatico)

### Android
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- BLUETOOTH (Android < 12)
- BLUETOOTH_ADMIN (Android < 12)
- BLUETOOTH_SCAN (Android >= 12)
- BLUETOOTH_CONNECT (Android >= 12)

I permessi sono già configurati nel file `app.json`.

## Troubleshooting

### Beacon BlueUp non vengono rilevati

I beacon BlueUp hanno alcune caratteristiche speciali che potrebbero richiedere attenzione:

#### 1. Verifica l'UUID configurato
I beacon BlueUp possono avere UUID personalizzati. Per verificare:
1. Scarica l'app **BlueBeacon Manager** ([Android](https://play.google.com/store/apps/details?id=com.blueup.bluebeacon) / [iOS](https://apps.apple.com/it/app/bluebeacon-manager/id1234567890))
2. Connettiti al beacon
3. Controlla l'UUID nella sezione iBeacon
4. Se l'UUID è diverso da `ACFD065E-C3C0-11E3-9BBE-1A514932AC01`, aggiungilo nell'array `COMMON_BEACON_UUIDS` nell'app

#### 2. Verifica la modalità iBeacon
I beacon BlueUp supportano multiple modalità (iBeacon, Eddystone, etc.):
- Verifica che la modalità **iBeacon sia attiva** tramite l'app BlueBeacon Manager
- Controlla l'intervallo di advertising (consigliato: 100-1000ms)
- Verifica la potenza di trasmissione (TX Power)

#### 3. Stato della batteria
- Batteria scarica può ridurre drasticamente la portata
- Verifica lo stato della batteria tramite l'app BlueBeacon Manager
- I beacon con batteria < 20% potrebbero avere portata ridotta

#### 4. Modalità "Anonymous Mode"
- Se configurati in "Anonymous Mode", i beacon BlueUp non trasmettono il BlueUp Advertising Packet
- Questo non influenza la trasmissione iBeacon, ma può rendere più difficile l'identificazione

### L'app non rileva beacon su iOS
1. Verifica che l'UUID nel codice corrisponda a quello dei tuoi beacon
2. Controlla che i permessi di localizzazione siano stati concessi ("Sempre" o "Quando in uso")
3. Assicurati che il Bluetooth sia attivo
4. Prova ad avvicinare il dispositivo al beacon (< 1 metro)
5. Controlla i log della console per vedere quali regioni sono state avviate

### L'app non rileva beacon su Android
1. Verifica che tutti i permessi siano stati concessi
2. Controlla che i servizi di localizzazione siano attivi (richiesto per BLE)
3. Assicurati che il Bluetooth sia attivo
4. Su Android 12+, verifica i nuovi permessi Bluetooth (BLUETOOTH_SCAN, BLUETOOTH_CONNECT)

### I beacon compaiono e scompaiono
- Questo è normale! I beacon trasmettono a intervalli e il segnale può variare
- L'app rimuove automaticamente i beacon non visti negli ultimi 5 secondi
- Puoi modificare questo timeout nel codice (linea ~234):
  ```typescript
  if (Date.now() - prevBeacon.timestamp < 5000) { // <-- Cambia 5000 (5 secondi)
  ```

## Riferimenti

- [react-native-kontaktio Documentation](https://github.com/Driversnote-Dev/react-native-kontaktio)
- [Kontakt.io SDK iOS](https://github.com/kontaktio/kontakt-ios-sdk)
- [Kontakt.io SDK Android](https://kontakt-api-docs.stoplight.io/docs/dev-ctr-sdks/423dcaf4067cc-android-sdk-changelog)

