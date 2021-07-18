const codeStates = {
    c: '#include <stdio.h>\n\nint main() {\n  printf("Hello World!");\n\  return 0;\n}\n',
    cpp: '#include <iostream>\n\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}\n',
    rust: 'fn main() {\n  println!("Hello World!");\n}\n'
};
let editor;

window.onload = _ => {
    let code = $('.editor')[0];
    editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/x-csrc',
        lineWrapping: true
    });
    editor.setValue(codeStates.c);
    $('#languages').focusin(function() {
		codeStates[this.value] = editor.getValue();
    });
    $('#languages').change(function () {
        changeLanguage(this.value);
    });
    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);

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
    editor.setValue(codeStates[val]);
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
                // Create new output line
                const line = $('<div/>', { text: e.responseText });
                line.appendTo('#output-container');
                // Scroll to bottom of container
                line.get(0).scrollIntoView();
                // Ensure clear button is enabled
                $('#clearOutput').prop('disabled', false);
            }
        }
    });
}

function clearOutput() {
    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);
    $('#output-container').empty();
}

function copyEmbeddedCode(id) {
    // Select and copy text into clipboard
    const text = $(`#${id}`).select();
    document.execCommand('copy');
    // Hide popup and show successfully copy toast.
    $('#embedCodeModal').modal('hide');
    $('#copiedToast').toast({delay:1000}).toast('show');
}

function createLinktoCode() {
    $('#email').click(function (e) {
        e.preventDefault();
    });
}