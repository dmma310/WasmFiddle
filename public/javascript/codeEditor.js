let editor;

window.onload = _ => {
    let code = $('.editor')[0];
    editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/x-csrc',
        lineWrapping: true
    });
    $('#languages').change(function () {
        changeLanguage(this.value);
    });
    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);

    // TODO: Create this functionality
    // Generate Embeddable code
    createEmbedded();

    // Send link to code via email
    createLinktoCode();
}

function changeLanguage(val) {
    if (val === 'c') {
        editor.setOption('mode', 'text/x-csrc');
    }
    else if (val === 'cpp') {
        editor.setOption('mode', 'text/x-c++src');
    }
    else if (val === 'rust') {
        editor.setOption('mode', 'text/x-rustsrc');
    }
}

function executeCode() {
    $.ajax({
        url: '/',
        method: 'POST',
        data: {
            language: $('#languages').val(),
            code: editor.getValue()
        },
        complete: (e, status, settings) => {
            if (e.status === 201) {
                let line = document.createElement('div');
                const text = document.createTextNode(e.responseText);
                line.appendChild(text);
                $('#output-container').append(line);
                // $('#output-container').append(`<div>${text}</div>`);
                // Ensure clear button is enabled
                $('#clearOutput').prop('disabled', false);
                line.scrollIntoView(false);
            }
        }
    });
}

function clearOutput() {
    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);
    $('#output-container').empty();
}

function createEmbedded() {
    $('#embed').click(function(e) {
        e.preventDefault();
    });
}

function createLinktoCode() {
    $('#email').click(function(e) {
        e.preventDefault();
    });
}