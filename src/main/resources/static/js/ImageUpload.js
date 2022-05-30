class ImageUpload {
    static matchExtRegex = /(?:\.([^.]+))?$/;
    static portraitRatio = "1:1.2";
    static defaultRatio = "1:0.75";
    static squareRatio = "1:1";
    static squareWidth = 22;
    static squareHeight = 22;
    static portraitWidth = 25
    static portraitHeight = 30
    static defaultWidth = 32;
    static defaultHeight = 22;

    constructor(setting) {

        this.id = isNull(setting.id) ? "image-box1": setting.id;
        this.width = isNull(setting.width) ? 32: parseInt(setting.width);
        this.height = isNull(setting.height) ? 22: parseInt(setting.height);
        this.inputName = isNull(setting.inputName) ? "tempImage1" : setting.inputName;
        this.delColumn = isNull(setting.delColumn) ? "delImage": setting.delColumn;
        this.ratio = isNull(setting.ratio) ? ImageUpload.defaultRatio : setting.ratio;

        //fixme
        this.$template = $(`
                <div class="image-upload-container file-upload border dropZone d-flex justify-content-center align-items-center" style="width: ${this.width}vw; height:${this.height}vw;" >
                    <div class="image-upload-wrap">
                        <input class="file-upload-input" type="file" name=${this.inputName} th:field="${this.inputName}" id="${this.inputName}">
                        <div class="text-center">
                             <img src="/img/custom-plus.png" alt="플러스버튼">
                        </div>
                    </div>
                    <div class="image-content">
                        <a class="lightbox"></a>
                    </div>
                </div>
            `);
        this.$box = $('#' + this.id);
        //init
        this.init();

        this.$file = this.$box.find("input[type='file']");
        this.$imgContainer = this.$box.find('.image-upload-container');
        this.$removeBtn = $(`<span class="btn-sm btn-default remove position-absolute" style="z-index: 1; top: 0; right: 0;"><i class="fa fa-times text-dark"></i></span>`);
        this.$imgContent = this.$box.find(".image-content");


        //파일등록
        this.$box.on('change', 'input[type="file"]',  e => {
            this.tryUpload(e);
        });

        this.$box.on('drop', '.dropZone', e => {
            this.tryUpload(e);
        });

        //확대 클릭
        this.$box.on('click', '.image-content', e => {
            e.preventDefault();
            let src = $(e.target).css("background-image").replace(/^url\(['"](.+)['"]\)/, '$1');
            if(!isNull(src) && src !== 'none') SimpleLightbox.open({items: [src]});
        });

        //신규 파일 삭제
        this.$box.on('click', '.template-upload.remove', e => {
            e.preventDefault();
            this.$file.val('');
            this.revert();
        });

    }
    tryUpload(e) {
        if(!isNull(this.$box.find('.remove').data('id'))) {
            this.$box.append($(`<input type="hidden" name=${this.delColumn}>`).val(this.$box.find('.remove').data('id')));
        }
        const file = e.target.files[0];

        // console.log("file::{}", file);
        // console.log("$hiddenImg::{}", this.$hiddenImg);
        // console.log("this.files::{}",  e.target);


        const onconfirm = (output) => {
            console.log("onConfirm::{}", output);
            const file = output.file;
            this.drawBackground(URL.createObjectURL(file));

            this.$box.find('.remove').addClass('template-upload');
            this.$imgContainer.addClass('position-relative');
            this.$box.find('.image-upload-wrap').addClass('d-none');
            this.$imgContainer.removeClass('file-upload');
            // this.$hiddenImg = $(image);

            //crop된 이미지로 파일 다시담기
            const dt = new DataTransfer();
            const input = document.getElementById(this.inputName);
            const { files } = input;
            for (let i = 0; i < files.length; i++) {
                dt.items.add(new File([file], file.name, {
                    type: file.type,
                    lastModified: new Date(),
                    lastModifiedDate: file.lastModifiedDate,
                    size: file.size,
                }));
                input.files = dt.files;
            }

        }
        const option = this.createDokaOption(file, onconfirm, this.ratio);
        $.fn.doka.create(option);
    }

    drawBackground(src) {
        this.$imgContent.css('background-image', `url(${src}`);
        this.$imgContent.css('background-repeat', 'no-repeat');
        this.$imgContent.css('background-size', 'cover');
        this.$imgContent.css('width', `100%`);
        this.$imgContent.css('height', `100%`);
        this.$box.find('a.lightbox').append(this.$removeBtn.clone());
    }

    revert() {
        this.$box.find('a.lightbox').empty();
        this.$box.find('.image-upload-wrap').removeClass('d-none');
        this.$imgContainer.removeClass('position-relative');
        this.$imgContainer.addClass('file-upload');

        this.$imgContent.css('background-image', '');
        this.$imgContent.css('background-repeat', 'no-repeat');
        this.$imgContent.css('background-size', 'cover');
        this.$imgContent.css('width', '');
        this.$imgContent.css('height', '');
    }
    /**
     * 업로드 reset
     */
    reset() {
        this.$box.empty();
    }
    removeBtnOff(file) {
        console.log("file::{}", file, typeof file);
        if(!file) this.$imgContainer.empty();
        else this.$box.find('.remove').remove();
    }

    init() {
        this.$box.append(this.$template.clone());
    }

    setImage(file) {
        console.log("setImage::{}", file);
        if(!file) return;
        let url = '/download/IMAGE/' + file.hash;
        this.drawBackground(url);

        this.$box.find('.remove').addClass('template-exist');
        this.$box.find('.remove').data('id', file.id);
        this.$imgContainer.addClass('position-relative');
        this.$box.find('.image-upload-wrap').addClass('d-none');
        this.$imgContainer.removeClass('file-upload');
        // this.$hiddenImg = $(image);

        //기존 파일 삭제
        this.$box.on('click', '.template-exist.remove', e => {
            e.preventDefault();
            this.$box.append($(`<input type="hidden" name=${this.delColumn}>`).val(this.$box.find('.remove').data('id')));
            this.$file.val('');
            this.revert();
        });

    }

    createDokaOption(file, onconfirm, ratio) {
        console.log("this.ratio::{}", ratio);
        return {
            src: file,
            utils: ['crop', 'color', 'markup'],
            allowAutoDestroy: true,
            // cropAllowResizeRect: false,
            cropAspectRatio: ratio,
            /*cropAspectRatioOptions: [
                {
                    label: 'Portrait',
                    value: '1:1.2',
                },
                {
                    label: 'Free',
                    value: '1:0.75',
                },
                {
                    label: 'Square',
                    value: '1:1',
                }
            ],*/
            // outputWidth: 1000,
            // outputHeight: 1000,
            labelButtonCancel: '취소',
            labelButtonConfirm: '완료',
            labelStatusAwaitingImage: '이미지 대기중...',
            labelStatusLoadingImage: '이미지 로딩중...',
            labelStatusLoadImageError: '이미지 로딩 오류',
            labelStatusProcessingImage: '이미지 처리중',
            labelColorBrightness: '밝기',
            labelColorContrast: '대비',
            labelColorExposure: '노출',
            labelColorSaturation: '채도',
            labelResizeWidth:'너비',
            labelResizeHeight:'높이',
            labelResizeApplyChanges:'적용',
            labelCropInstructionZoom:'마우스 휠이나 터치패드로 확대/축소가 가능합니다',
            labelButtonCropZoom: '확대/축소',
            labelButtonCropRotateLeft: '좌로 회전',
            labelButtonCropRotateRight: '우로 회전',
            labelButtonCropFlipHorizontal: '좌우 반전',
            labelButtonCropFlipVertical: '상하 반전',
            labelButtonCropAspectRatio:'크기 비율',
            labelButtonCropToggleLimit:'선택영역 잘라내기',
            labelButtonUtilCrop:'잘라내기',
            labelButtonUtilFilter:'필터',
            labelButtonUtilColor:'컬러 조정',
            labelButtonUtilResize:'크기 조정',
            labelButtonUtilMarkup:'그리기',
            labelButtonUtilSticker:'스티커',
            labelMarkupTypeRectangle:'사각형',
            labelMarkupTypeEllipse:'원',
            labelMarkupTypeText:'텍스트',
            labelMarkupTypeLine:'화살표',
            labelMarkupSelectFontSize:'글꼴 크기',
            labelMarkupSelectFontFamily:'글꼴',
            labelMarkupSelectLineDecoration:'장식',
            labelMarkupSelectLineStyle:'스타일',
            labelMarkupSelectShapeStyle:'스타일',
            labelMarkupRemoveShape:'삭제',
            labelMarkupToolSelect:'선택',
            labelMarkupToolDraw:'그리기',
            labelMarkupToolLine:'화살표',
            labelMarkupToolText:'텍스트',
            labelMarkupToolRect:'사각형',
            labelMarkupToolEllipse:'원',
            onconfirm
        };
    }


}
