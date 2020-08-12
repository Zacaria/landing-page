var tld_ =  "com", topDom_ = 13, m_ = "mailto:", a_ = "@", d_ = ".";
function e_() { return 'havesomecode'+a_+'gmail'+d_+tld_; }
const icon = document.createElement('i');
icon.classList.add('fas');
icon.classList.add('fa-envelope');
const link = document.createElement('a');
link.setAttribute('title', 'Email');
link.setAttribute('href', m_+e_());
link.appendChild(icon);
document.getElementsByClassName('external-links')[0].appendChild(link);

