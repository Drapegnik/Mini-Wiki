$(document).ready(function () {
    var dropZone = $('#dropZone'),
        maxFileSize = 5000000; // максимальный размер файла - 1 мб.

    if (typeof(window.FileReader) == 'undefined') {
        dropZone.text('Не поддерживается браузером!');
        dropZone.addClass('error');
    }

    dropZone[0].ondragover = function () {
        dropZone.addClass('hover');
        return false;
    };

    dropZone[0].ondragleave = function () {
        dropZone.removeClass('hover');
        return false;
    };

    dropZone[0].ondrop = function (event) {
        event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');

        var file = event.dataTransfer.files[0];

        if (file.size > maxFileSize) {
            dropZone.text('Файл слишком большой!');
            dropZone.addClass('error');
            return false;
        }

        console.log(file);

        document.getElementsByName('id_photo').value = file;
    };

    //function uploadProgress(event) {
    //    var percent = parseInt(event.loaded / event.total * 100);
    //    dropZone.text('Загрузка: ' + percent + '%');
    //}
    //
    //function stateChange(event) {
    //    if (event.target.readyState == 4) {
    //        if (event.target.status == 200) {
    //            dropZone.text('Загрузка успешно завершена!');
    //        } else {
    //            dropZone.text('Произошла ошибка!');
    //            dropZone.addClass('error');
    //        }
    //    }
    //}
});

