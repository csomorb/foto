import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {

  isHovering: boolean;
  progressInfos = [];
  message = '';
  fileInfos: Observable<any>;

  files = [];

  constructor(private apiService: ApiService) { }

  uploadFiles() {
    this.message = '';

    for (let i = 0; i < this.files.length; i++) {
      this.upload(i, this.files[i]);
    }
  }

  upload(idx, file) {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    this.apiService.upload(file,4,'','').subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          // this.fileInfos = this.uploadService.getFiles();
          console.log('reponse: ');
          console.log(event);
        }
      },
      err => {
        this.progressInfos[idx].value = 0;
        this.message = 'Could not upload the file:' + file.name;
      });
  }

  ngOnInit(): void {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      var reader = new FileReader();
      reader.onload = (even:any) => {
        //TODO : a délocaliser quand visible dans le viewport
        this.files.push(files.item(i));
        this.files[this.files.length - 1].data = even.target.result;
        this.files[this.files.length - 1].toBeLoaded = true;
      }
      reader.readAsDataURL(files.item(i));
    }
  }

  onAddFiles(event){
    if (event.target.files && event.target.files[0]) {
      this.onDrop(event.target.files);
    }
  }

}
