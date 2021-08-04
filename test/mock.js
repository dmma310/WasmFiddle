module.exports = {
    valid: {
        c: {
            language: 'c',
            options: '-std=c17',
            code: '#include <stdio.h>\n\nint main() {\n  printf("Hello World!");\n\  return 0;\n}\n'
        },
        cpp: {
            language: 'cpp',
            options: '-std=c++17',
            code: '#include <iostream>\n\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}\n'
        },
        rust: {
            language: 'rust',
            options: '',
            code: 'fn main() {\n  println!("Hello World!");\n}\n'
        }
    },
    compileErr: {
        c: {
            language: 'c',
            options: '-std=c17',
            code: '#include <stdio.h>\n\nint main() {\n  printf("Hello World!")\n\  return 0;\n}\n'
        },
        cpp: {
            language: 'cpp',
            options: '-std=c++17',
            code: '#include <iostream>\n\nint main() {\n  std::cout << "Hello World!"\n  return 0;\n}\n'
        },
        rust: {
            language: 'rust',
            options: '',
            code: 'fn main() {\n  println("Hello World!");\n}\n'
        }
    },
    runtimeErr: {
        c: {
            language: 'c',
            options: '-std=c17',
            code: '#include <stdio.h>\n\nint main() {\n  int a = 1/0;\n\  return 0;\n}\n'
        },
        cpp: {
            language: 'cpp',
            options: '-std=c++17',
            code: '#include <iostream>\n\nint main() {\n  int a = 1/0;\n  return 0;\n}\n'
        },
        rust: {
            language: 'rust',
            options: '',
            code: 'fn main() {\n  let a = 1/0;\n}\n'
        }
    }
};