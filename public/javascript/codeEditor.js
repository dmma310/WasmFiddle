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
const RUST_LINK = 'rust link'.link('https://www.rust-lang.org/tools/install');
const GCC_LINK = 'gcc link'.link('https://gcc.gnu.org/git.html');
const GIT_LINK = 'git link'.link('https://git-scm.com/downloads');

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
    const lang = $('#languages').val();
    editor.setValue(codeStates[lang].code);
    // Cascade std options dropdown
    filterStdOptions(lang);
    // Select default value
    const std = codeStates[lang].selected;
    $('#std-options').val(std);

    $('#languages').focusin(function () {
        codeStates[this.value].code = editor.getValue();
    });
    // When user selects new language, update selected value and compilation instructions
    $('#languages').change(function () {
        changeLanguage(this.value);
        filterStdOptions(this.value);
        $('#std-options').val(codeStates[this.value].selected);
        // Update compile instructions
        updateInstruct(this.value, $('#std-options').val());
    });
    // When user selects new std, update selected value and compilation instructions
    $('#std-options').change(function () {
        codeStates[$('#languages').val()].selected = this.value;
        // Update compile instructions
        updateInstruct($('#languages').val(), this.value);
    });

    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);

    // Send link to code via email
    createLinktoCode();

    // Show instructions for how to compile
    updateInstruct(lang, std);
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
        return `<option value="${opt}">${opt}</option>`;
        // return '<option value="' + opt + '"> ' + opt + '</option>';
    }).join('');
    $('#std-options').html(html);
}

function executeCode() {
    $.ajax({
        url: '/',
        method: 'POST',
        data: {
            language: $('#languages').val(),
            options: `-std=${$('#std-options').val()}`,
            code: editor.getValue()
        },
        complete: (e, status, settings) => {
            if (e.status === 201) {
                // Create new output line
                const line = $('<div/>', {
                    text: e.responseText,
                    class: 'line'
                });
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
    $('#copiedToast').toast({ delay: 1000 }).toast('show');
}

function createLinktoCode() {
    $('#email').click(function (e) {
        e.preventDefault();
    });
}

// Use like compileInstruc('gcc', [Wall, std=gnu89], 'hello.c');
function compileInstruc(compiler, options, file) {
    return `${compiler} -${options.join('- ')} ${file} -o ${file.substr(0, file.indexOf('.'))}`;
}

function runInstruc(lang, std, file) {
    let compileCmd, compilerLink;
    if (lang === 'rust') {
        compileCmd = `rustc ${file}`;
        compilerLink = RUST_LINK;
    }
    else {
        compilerLink = GCC_LINK;
        compileCmd = compileInstruc(lang === 'c' ? 'gcc' : 'g++', [`std=${std}`], file);
    }
    return `NOTE: Ensure you have Git installed:<br>\
    ${GIT_LINK}<br>\
    1. Download the language compiler:<br>\
    ${compilerLink}<br>\
    2. Run the following command to compile the file:\n\
    ${compileCmd}<br>\
    3. Execute the newly compiled file:<br>\
    Windows: .\\${file.substr(0, file.indexOf('.'))}.exe<br>\
    Other: ./${file.substr(0, file.indexOf('.'))}<br>`;
}

function updateInstruct(lang, options) {
    // Show instructions for how to compile
    let langExt;
    if (lang === 'rust') {
        langExt = 'rs';
    }
    else {
        langExt =  $('#languages').val();
    }
    const instruct = runInstruc(lang, options, `hello.${langExt}`);
    $('#instructions-container').html(instruct);
}