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
        url: "/",
        method: "POST",
        data: {
            language: $("#languages").val(),
            code: editor.getValue()
        },
        complete: (e, status, settings) => {
            if (e.status === 201) {
                let line = document.createElement("div");
                let text = document.createTextNode(e.responseText);
                line.appendChild(text);
                $("#output-container").append(line);

		        line.scrollIntoView(false);
	        }
        }
    });
}

function clearOutput() {
    $("#output-container").empty();
}
