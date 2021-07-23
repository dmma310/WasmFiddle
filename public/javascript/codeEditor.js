const codeStates = {
    c: {
        code: '#include <stdio.h>\n\nint main() {\n  printf("Hello World!");\n\  return 0;\n}\n',
        options: ['c89', 'gnu89', 'c94', 'c99', 'gnu99', 'c11', 'gnu11', 'c17', 'gnu17', 'c2x', 'gnu2x'],
        selected: 'c17'
    },
    cpp: {
        code: '#include <iostream>\n\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}\n',
        options: ['c++89', 'c++11', 'c++14', 'c++17', 'c++20'],
        selected: 'c++17'
    },
    rust: {
        code: 'fn main() {\n  println!("Hello World!");\n}\n',
        options: [],
        selected: ''
    }
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
    // Set default code
    editor.setValue(codeStates[$('#languages').val()].code);
    // Cascade std options dropdown
    filterStdOptions($('#languages').val());
    // Select default value
    $('#std-options').val(codeStates[$('#languages').val()].selected);

    $('#languages').focusin(function () {
        codeStates[this.value].code = editor.getValue();
    });
    $('#languages').change(function () {
        changeLanguage(this.value);
        filterStdOptions(this.value);
        $('#std-options').val(codeStates[this.value].selected);
    });
    $('#std-options').change(function () {
        codeStates[$('#languages').val()].selected = this.value;
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
    editor.setValue(codeStates[val].code);
}

function filterStdOptions(val) {
    // Get and set standards associated with language
    const html = $.map(codeStates[val].options, opt => {
        return '<option value="' + opt + '"> ' + opt + '</option>';
    }).join('');
    $('#std-options').html(html);
}

function executeCode() {
    $.ajax({
        url: '/',
        method: 'POST',
        data: {
            language: $('#languages').val(),
            options: '-std=' + $('#std-options').val(),
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
