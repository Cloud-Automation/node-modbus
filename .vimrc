set t_Co=256
syntax on
set background=light
colorscheme distinguished

set expandtab
set shiftwidth=2
set softtabstop=2

let g:syntastic_javascript_checkers = ['standard']

autocmd bufwritepost *.js silent !standard --fix %
set autoread

Plugin 'pangloss/vim-javascript'
Plugin 'nathanaelkane/vim-indent-guides'
Plugin 'Raimondi/delimitMate'

Plugin 'scrooloose/syntastic'

let g:syntastic_check_on_open=1
