set nocompatible
filetype plugin indent on
set tabstop=2
set softtabstop=2
set shiftwidth=2
set expandtab

set t_Co=256
syntax on
set background=light
colorscheme distinguished

let g:formatters_html = ['htmlbeautify']

let g:syntastic_html_checkers = ['jshint']
let g:syntastic_javascript_checkers = ['standard']
let g:syntastic_check_on_open=1

autocmd BufWritePost *.js silent !standard --fix %
autocmd BufWrite * :Autoformat

set autoread
