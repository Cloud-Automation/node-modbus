let g:sytastic_javascript_checkers = ['standard']

autocmd bufwritepost *.js silent !standard-format -w %
set autoread

set smartindent
set tabstop=2
set shiftwidth=2
set expandtab

set t_Co=256
syntax on
set background=dark
colorscheme distinguished
