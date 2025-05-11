document.addEventListener('DOMContentLoaded', function() {
    // Elementi DOM
    const alfabetoSelect = document.getElementById('alfabeto');
    const letteraSelect = document.getElementById('lettera');
    const numeroDisplay = document.getElementById('numero-display');
    const avantiBtn = document.getElementById('avanti');
    const indietroBtn = document.getElementById('indietro');
    const audioToggleBtn = document.getElementById('audio-toggle');
    
    // Configurazione
    const alfabeti = {
        italiano: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        inglese: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    };
    
    // Stato dell'applicazione
    let statoCorrente = {
        lettera: 'A',
        numero: 0,
        audioAttivo: true
    };
    
    // Inizializzazione
    popolaLettere();
    aggiornaDisplay();
    
    // Event Listeners
    alfabetoSelect.addEventListener('change', popolaLettere);
    letteraSelect.addEventListener('change', cambiaLettera);
    avantiBtn.addEventListener('click', avanzaTurno);
    indietroBtn.addEventListener('click', arretraTurno);
    audioToggleBtn.addEventListener('click', toggleAudio);
    
    // Funzioni
    function popolaLettere() {
        const tipoAlfabeto = alfabetoSelect.value;
        const lettere = alfabeti[tipoAlfabeto];
        
        // Salva la lettera corrente
        const letteraCorrente = letteraSelect.value || 'A';
        
        // Svuota e ripopola il select delle lettere
        letteraSelect.innerHTML = '';
        
        lettere.forEach(lettera => {
            const option = document.createElement('option');
            option.value = lettera;
            option.textContent = lettera;
            letteraSelect.appendChild(option);
        });
        
        // Ripristina la lettera selezionata se possibile
        if (lettere.includes(letteraCorrente)) {
            letteraSelect.value = letteraCorrente;
        }
        
        // Aggiorna lo stato
        statoCorrente.lettera = letteraSelect.value;
        aggiornaDisplay();
    }
    
    function cambiaLettera() {
        statoCorrente.lettera = letteraSelect.value;
        statoCorrente.numero = 0; // Reset del numero quando si cambia lettera manualmente
        aggiornaDisplay();
        riproduciSuono('avanti');
        pronunciaNumero();
    }
    
    function avanzaTurno() {
        statoCorrente.numero++;
        
        // Se il numero supera 99, passa alla lettera successiva
        if (statoCorrente.numero > 99) {
            const tipoAlfabeto = alfabetoSelect.value;
            const lettere = alfabeti[tipoAlfabeto];
            const indiceLetteraCorrente = lettere.indexOf(statoCorrente.lettera);
            
            // Se c'è una lettera successiva, passa ad essa
            if (indiceLetteraCorrente < lettere.length - 1) {
                statoCorrente.lettera = lettere[indiceLetteraCorrente + 1];
                letteraSelect.value = statoCorrente.lettera;
            } else {
                // Altrimenti torna alla prima lettera
                statoCorrente.lettera = lettere[0];
                letteraSelect.value = statoCorrente.lettera;
            }
            
            statoCorrente.numero = 0;
        }
        
        aggiornaDisplay();
        riproduciSuono('avanti');
        setTimeout(pronunciaNumero, 1000); // Pronuncia dopo una pausa
    }
    
    function arretraTurno() {
        statoCorrente.numero--;
        
        // Se il numero diventa negativo, passa alla lettera precedente
        if (statoCorrente.numero < 0) {
            const tipoAlfabeto = alfabetoSelect.value;
            const lettere = alfabeti[tipoAlfabeto];
            const indiceLetteraCorrente = lettere.indexOf(statoCorrente.lettera);
            
            // Se c'è una lettera precedente, passa ad essa
            if (indiceLetteraCorrente > 0) {
                statoCorrente.lettera = lettere[indiceLetteraCorrente - 1];
                letteraSelect.value = statoCorrente.lettera;
            } else {
                // Altrimenti vai all'ultima lettera
                statoCorrente.lettera = lettere[lettere.length - 1];
                letteraSelect.value = statoCorrente.lettera;
            }
            
            statoCorrente.numero = 99;
        }
        
        aggiornaDisplay();
        riproduciSuono('indietro');
        setTimeout(pronunciaNumero, 1000); // Pronuncia dopo una pausa
    }
    
    function aggiornaDisplay() {
        // Formatta il numero con zero iniziale se necessario
        const numeroFormattato = statoCorrente.numero.toString().padStart(2, '0');
        numeroDisplay.textContent = `${statoCorrente.lettera}${numeroFormattato}`;
    }
    
    function toggleAudio() {
        statoCorrente.audioAttivo = !statoCorrente.audioAttivo;
        audioToggleBtn.innerHTML = statoCorrente.audioAttivo ? '<span class="icon">&#128266;</span>' : '<span class="icon">&#128263;</span>';
    }
    
    function riproduciSuono(tipo) {
        if (!statoCorrente.audioAttivo) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const durata = 0.15; // durata di ciascun tono in secondi
        
        // Frequenze per i toni (in Hz)
        const tonoGrave = 440; // La4
        const tonoAcuto = 880; // La5
        
        // Crea oscillatori
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configura gli oscillatori
        if (tipo === 'avanti') {
            oscillator1.frequency.value = tonoGrave;
            oscillator2.frequency.value = tonoAcuto;
        } else { // indietro
            oscillator1.frequency.value = tonoAcuto;
            oscillator2.frequency.value = tonoGrave;
        }
        
        // Collega gli oscillatori
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Riproduci il primo tono
        oscillator1.start();
        oscillator1.stop(audioContext.currentTime + durata);
        
        // Riproduci il secondo tono dopo il primo
        oscillator2.start(audioContext.currentTime + durata);
        oscillator2.stop(audioContext.currentTime + durata * 2);
    }
    
    function pronunciaNumero() {
        if (!statoCorrente.audioAttivo || !window.speechSynthesis) return;
        
        // Formatta il numero con zero iniziale se necessario
        const numeroFormattato = statoCorrente.numero.toString().padStart(2, '0');
        const testoCompleto = `${statoCorrente.lettera} ${numeroFormattato}`;
        
        const utterance = new SpeechSynthesisUtterance(testoCompleto);
        utterance.lang = 'it-IT'; // Imposta la lingua italiana
        utterance.rate = 0.9; // Leggermente più lento per maggiore chiarezza
        
        window.speechSynthesis.speak(utterance);
    }
});