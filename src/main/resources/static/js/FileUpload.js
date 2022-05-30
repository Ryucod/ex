class FileUpload {

    static matchExtRegex = /(?:\.([^.]+))?$/;
    /*
        *
         * 파일 업로드 생성
         * @param id 버튼 selector string
         * @param delPrefix 삭제 input prefix
         * @param type image, profile, attach, imageRaw(doka 없이 업로드)
         * @param maxCount 최대 업로드 숫자
    */
    constructor(setting) {

        this.files = [];
        this.id = isNull(setting.id) ? "attach-upload": setting.id;
        this.idString = this.id;
        this.$fileInput = $('#' + this.id);
        this.$container = $('#' + this.id + '-container');
        this.$template = $(`
                <tr class="data-group-item text-center">
                    <td class="data-group-item-index"><span class="index"></span></td>
                    <td class="data-group-item-filename"><span class="filename"></span></td>
                    <td><span class="size"></span></td>
                    <td class="data-group-item-button">
                       <a class="btn btn-warning cancel"><i class="fa fa-remove"></i></a>
<!--                       <a class="btn btn-info download d-none"><i class="fa fa-download"></i></a>-->
                    </td>
                    <td class="data-group-item-button d-none">
                       <a class="btn btn-info download"><i class="fa fa-download"></i></a>
                    </td>
                </tr>
            `);
        this.$existContainer = isNull(setting.existId)? $('#exist-container') : $('#' + setting.existId);
        this.delColumn = isNull(setting.delColumn) ? "delAttachIdList": setting.delColumn;
        //확장자
        // const allowExts = this.$button.attr('accept').split(',').map(e => e.replace('\.', '').toLowerCase());
        //파일 max size
        const maxFileSize = parseInt(this.$fileInput.data('maxSize'));

        //신규업로드 삭제
        this.$container.on('click', '.template-upload .cancel', e => {
            e.preventDefault();
            if(!confirm("삭제 하시겠습니까?")) {
                return;
            }
            const $tr = $(e.target).closest('.data-group-item');
            const index = parseInt($tr.data('seq'));
            // console.log("index::{}", index);
            $tr.remove();
            this._drawIndex();


            const dt = new DataTransfer();
            const input = document.getElementById(this.id);
            const { files } = input;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (index !== i) dt.items.add(file);
                input.files = dt.files;
            }
        });

        this.$fileInput.on('change', e => {
            // console.log("change::{}");
            this.$container.empty();
            // this.$fileInput.val('');
            //업로드 시도
            const files = e.target.files;
            //파일 확인 누를시
            const onconfirm = output => {
                //파일 객체
                const file = output;
                //이미지 리스트
                const $tr = this.$template.clone();
                $tr.addClass('template-upload');
                //파일 객체 데이터 리스트에 저장
                $tr.data('file', file);
                //파일네임 지정
                $tr.find('.filename').text(file.name);
                //파일 사이즈 지정
                $tr.find('.size').text(this._formatFileSize(file.size));
                // $tr.find('.download').prop('href', URL.createObjectURL(file));
                //파일 인덱스 지정
                $tr.find('.index').text(this.$container.find('tr').length + 1);

                $tr.data('seq', this.$container.find('tr').length);
                //추가
                this.$container.append($tr);

            };
            for(let value of files) {
                onconfirm(value);
            }
        });



    }
    //파일 인덱스 그리기
     _drawIndex() {
        console.log("draw::{}", this.$container.find('.index'));
        if(!this.$container.find('.index')) return;

        this.$container.find('.index').each((index, e) => {
            $(e).text(index + 1);
        });
    }

    _formatFileSize(bytes) {
        if (typeof bytes !== 'number') return;
        if (bytes >= Math.pow(1024, 3)) return (bytes / Math.pow(1024, 3)).toFixed(2) + ' GB';
        if (bytes >= Math.pow(1024, 2)) return (bytes / Math.pow(1024, 2)).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(2) + ' KB';
    }



    //파일 데이터 가져오기
    _getFiles() {
        this.files = [];
        this.$container.find('.template-upload').each((i, el) => {
            const file = $(el).data('file');
            this.files.push(file);
        });
        return this.files;
    }

    /**
     * 기존 파일 등록
     * @param
     */
    setFileList(fileList) {
        console.log("fileList::{}", typeof fileList);
        if (isNull(fileList) || fileList.length === 0 ) {
            this.$existContainer.closest('.row').remove();
            return;
        }
        // this.$existContainer.append(this.$existContainer.clone());
        //데이터 없으면 return
        fileList.forEach(attachment => {
            let file = attachment;

            if (!file) return;

            // console.log("file::{}", file);
            const $tr = this.$template.clone();
            $tr.addClass('template-exist');
            $tr.data('id', file.id);
            $tr.data('file', file);
            //파일네임 지정
            $tr.find('.filename').text(file.originalFilename);
            //파일 사이즈 지정
            $tr.find('.size').text(this._formatFileSize(file.size));
            //파일 인덱스 지정
            $tr.find('.index').text(this.$existContainer.find('tr').length + 1);

            this.$existContainer.parent().removeClass('d-none');
            $tr.find('.download').parent().removeClass('d-none');
            $tr.find('.download').prop('href', '/download/ATTACH/' + file.hash);
            //추가
            this.$existContainer.append($tr);

        });

        //기존 업로드 삭제
        this.$existContainer.on('click', '.template-exist .cancel', (e) => {
            e.preventDefault();
            if(!confirm("삭제 하시겠습니까?")) {
                return;
            }
            const $tr = $(e.target).closest('.data-group-item');
            console.log("val data::{}", $tr.data('id'));
            //삭제 input 추가
            this.$fileInput.append($(`<input type="hidden" name=${this.delColumn}>`).val($tr.data('id')));
            $tr.remove();
            if(this.$existContainer.find('tr').length === 0 || !this.$existContainer.find('tr')) {
                this.$existContainer.parent().parent().remove();
            }
        });

    }

    /**
     * 업로드 reset
     */
    reset() {
        this.files = [];
        this.$container.empty();
    }

    readOnly() {
        this.$fileInput.closest('.row').remove();
        this.$existContainer.find('a.btn.btn-warning').removeClass('cancel');
    }
}
