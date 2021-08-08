var codeStates = {
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
    // Set Code Editor configuration
    let code = $('.editor')[0];
    editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/x-csrc',
        lineWrapping: true
    });
    
    if(document.getElementById('share')) {
        const sharedCode = document.getElementById('share').getAttribute('data-code');
        const sharedLang = document.getElementById('share').getAttribute('data-lang');
        codeStates[sharedLang].code = sharedCode;
    }

    // Set default code
    const lang = $('#languages').val();
    editor.setValue(codeStates[lang].code);

    // Cascade std options dropdown
    filterStdOptions(lang);
    // Select default language and compile standard
    const std = codeStates[lang].selected;
    $('#std-options').val(std);

    $('#languages').focusin(function () {
        codeStates[this.value].code = editor.getValue();
    });

    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);

    // Send link to code via email
    createLinktoCode();

    // Show instructions for how to compile
    updateInstruct(lang, [`std=${std}`]);

    onChange(); // Listen for language or compile standard change
}

// Listen for language or compile standard change, update accordingly
function onChange() {
    // When user selects new language, update selected value,
    // default compile standard, and compilate instructions
    $('#languages').change(function () {
        changeLanguage(this.value);
        filterStdOptions(this.value);
        $('#std-options').val(codeStates[this.value].selected);
        // Update compile instructions
        updateInstruct(this.value, [`std=${$('#std-options').val()}`]);
        // Hide compile options if Rust
        if (this.value === 'rust') {
            $('#std-options').hide();
            $('.checkboxes').hide();
        } else {
            $('#std-options').show();
            $('.checkboxes').show();
        }
    });
    // When user selects new std, update selected value and compilation instructions
    $('#std-options').change(function () {
        codeStates[$('#languages').val()].selected = this.value;
        // Update compile instructions
        updateInstruct($('#languages').val(), [`std=${this.value}`]);
    });
}

// Set Code editor to new language mode
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

// Get and set standards associated with language
function filterStdOptions(val) {
    const html = $.map(codeStates[val].options, opt => {
        return `<option value="${opt}">${opt}</option>`;
    }).join('');
    $('#std-options').html(html);
}

// When user presses 'Run', send code to backend, and display results
function executeCode() {
    $.ajax({
        url: '/',
        method: 'POST',
        data: {
            language: $('#languages').val(),
            options: getOptions(),
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

// Clear output window and disable 'Clear' button
function clearOutput() {
    // Ensure clear button is disabled
    $('#clearOutput').prop('disabled', true);
    $('#output-container').empty();
}

// Select and copy text into clipboard
function copyEmbeddedCode(id) {
    $(`#${id}`).select();
    document.execCommand('copy');
    // Hide popup and show successfully copy toast.
    $('#embedCodeModal').modal('hide');
    $('#copiedToast').toast({ delay: 1000 }).toast('show');
}

function copyShareLink(id) {
    // Select and copy text into clipboard
    const text = $(`#${id}`).select();
    document.execCommand('copy');
    // Hide popup and show successfully copy .toast
    $('#shareLinkModal').modal('hide');
    $('#copiedToast').toast({delay:1000}).toast('show');
}

// For adding code to the database
function addCode() {
    $.ajax({
        url: '/',
        method: 'POST',
        data: {
            language: $('#languages').val(),
            code: editor.getValue(),
            share: 1
        },
        complete: (e, status, settings) => {
            if (e.status === 201) {
                document.getElementById('shareLink').value = e.responseText;
                $('#shareLinkModal').modal('show');
            }
        }
    });
}
// TODO: Email functionality
function createLinktoCode() {
    $('#email').click(function (e) {
        e.preventDefault();
    });
}

// Show instructions for how to compile
function updateInstruct(lang, options) {
    const langExt = lang === 'rust' ? 'rs' : $('#languages').val();
    const instruct = runInstruc(lang, options, 'hello', langExt);
    $('#instructions-container').html(instruct);
}

// Generate instructions for how to compile
function runInstruc(lang, options, fileName, ext) {
    let compileCmd, compilerLink;
    if (lang === 'rust') {
        compileCmd = `rustc ${fileName}`;
        compilerLink = RUST_LINK;
    }
    else {
        compilerLink = GCC_LINK;
        compileCmd = compileInstruc(lang === 'c' ? 'gcc' : 'g++', options, `${fileName}.${ext}`);
    }
    return `NOTE: Ensure you have Git installed:<br>\
    ${GIT_LINK}<br>\
    1. Download the language compiler:<br>\
    ${compilerLink}<br>\
    2. Run the following command to compile the file:\n\
    ${compileCmd}<br>\
    3. Execute the newly compiled file:<br>\
    Windows: .\\${fileName}.exe<br>\
    Other: ./${fileName}<br>`;
}

// Use like compileInstruc('gcc', [Wall, std=gnu89], 'hello.c');
function compileInstruc(compiler, options, file) {
    return `${compiler} -${options.join('- ')} ${file} -o ${file.substr(0, file.indexOf('.'))}`;
}

// Build string for compile options
function getOptions() {
    if ($('#languages').val() === 'rust') return '';
    let options = `-std=${$('#std-options').val()}`;
    $('input[name=warnings]:checked').each((i, el) => {
        options += ` -${el.value}`;
    })
    return options;
}