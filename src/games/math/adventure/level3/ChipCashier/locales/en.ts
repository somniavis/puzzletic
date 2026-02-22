const en = {
    title: 'Coin Cashier',
    subtitle: 'Master 5s and 10s!',
    description: 'Choose bundle counts to match the target chips.',
    ui: {
        customerRequest: 'Please make {{target}} coins total!',
        coinLabel: 'coin',
        bundleAria: '{{size}}-coin bundle',
        bundle5: 'Bundle of 5',
        bundle10: 'Bundle of 10',
        chooseCount: 'Choose bundles',
        dropZone: 'Chip Box'
    },
    howToPlay: {
        step1: {
            title: 'Customer Appears',
            description: 'Check target coins.'
        },
        step2: {
            title: 'Check Coin Type',
            description: 'Check 5 or 10.'
        },
        step3: {
            title: 'Choose the Count',
            description: 'Tap the correct count.'
        }
    }
} as const;

export default en;
