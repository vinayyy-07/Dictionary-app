document.getElementById('searchBtn').addEventListener('click', function() {
    let word = document.getElementById('wordInput').value;
    let resultDiv = document.getElementById('result');
    let historyList = document.getElementById('historyList');
    let partOfSpeechFilter = document.getElementById('partOfSpeechFilter');

    if (word.trim() === '') {
        resultDiv.innerHTML = '<p>Please enter a word.</p>';
        return;
    }

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
        .then(data => {
            if (data.title && data.title === "No Definitions Found") {
                resultDiv.innerHTML = `<p>No definitions found for "${word}".</p>`;
            } else {
                let meanings = data[0].meanings;
                let phonetics = data[0].phonetics;
                let partOfSpeechSet = new Set();
                let resultHtml = `<h3>${word}</h3>`;

                // Pronunciation Section
                if (phonetics.length > 0) {
                    resultHtml += `<p><strong>Pronunciation:</strong></p>`;
                    phonetics.forEach(phonetic => {
                        if (phonetic.audio) {
                            resultHtml += `<p><audio controls><source src="${phonetic.audio}" type="audio/mpeg">Your browser does not support the audio element.</audio> - /${phonetic.text}/</p>`;
                        }
                    });
                }

                // Definitions and Examples Section
                resultHtml += '<div id="definitions">';
                meanings.forEach(meaning => {
                    partOfSpeechSet.add(meaning.partOfSpeech);
                    let filteredPartOfSpeech = partOfSpeechFilter.value;
                    if (filteredPartOfSpeech === 'all' || filteredPartOfSpeech === meaning.partOfSpeech) {
                        resultHtml += `<p><strong>${meaning.partOfSpeech}:</strong> ${meaning.definitions[0].definition}</p>`;
                        if (meaning.definitions[0].example) {
                            resultHtml += `<p><em>Example:</em> "${meaning.definitions[0].example}"</p>`;
                        }
                        if (meaning.synonyms.length > 0) {
                            resultHtml += `<p><strong>Synonyms:</strong> ${meaning.synonyms.join(', ')}</p>`;
                        }
                        if (meaning.antonyms.length > 0) {
                            resultHtml += `<p><strong>Antonyms:</strong> ${meaning.antonyms.join(', ')}</p>`;
                        }
                    }
                });
                resultHtml += '</div>';
                resultDiv.innerHTML = resultHtml;

                // Populate the part of speech filter dropdown
                partOfSpeechFilter.innerHTML = `<option value="all">All Parts of Speech</option>`;
                partOfSpeechSet.forEach(partOfSpeech => {
                    let option = document.createElement('option');
                    option.value = partOfSpeech;
                    option.textContent = partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1);
                    partOfSpeechFilter.appendChild(option);
                });

                // Add to search history
                let historyItem = document.createElement('li');
                historyItem.textContent = word;
                historyList.appendChild(historyItem);

                // Enable saving to favorites
                document.getElementById('saveFavoriteBtn').disabled = false;
            }
        })
        .catch(error => {
            console.error('Error fetching the definition:', error);
            resultDiv.innerHTML = '<p>There was an error retrieving the definition. Please try again later.</p>';
        });
});

document.getElementById('saveFavoriteBtn').addEventListener('click', function() {
    let word = document.getElementById('wordInput').value;
    let favoritesList = document.getElementById('favoritesList');

    if (word.trim() === '') {
        alert('Please enter a word to save.');
        return;
    }

    // Save to localStorage
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(word)) {
        favorites.push(word);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Update UI
        let favoriteItem = document.createElement('li');
        favoriteItem.textContent = word;
        favoritesList.appendChild(favoriteItem);
    } else {
        alert('This word is already in your favorites.');
    }
});

// Load favorites from localStorage on page load
window.addEventListener('load', function() {
    let favoritesList = document.getElementById('favoritesList');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(word => {
        let favoriteItem = document.createElement('li');
        favoriteItem.textContent = word;
        favoritesList.appendChild(favoriteItem);
    });

    // Disable save button initially
    document.getElementById('saveFavoriteBtn').disabled = true;
});