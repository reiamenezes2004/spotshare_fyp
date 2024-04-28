function reply(sender) {
    var form = document.getElementById('reply-form');
    var message = document.getElementById('reply-message');
    form.style.display = 'block';
    message.focus();
    message.value = "Replying to: " + sender + "\n\n";
}
