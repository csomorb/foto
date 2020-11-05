import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  selectedAlbum: number;
  files = [];

  constructor(private apiService: ApiService,private fb: FormBuilder) {
    this.selectedAlbum = 0;
  }

  uploadFiles() {
    this.message = '';
    if (!this.selectedAlbum){
      this.message = 'Veuillez sélectionner un album';
      return;
    }

    for (let i = 0; i < this.files.length; i++) {
      if (!this.files[i].load){
        this.upload(i, this.files[i]);
      }
    }
  }

  upload(idx, file) {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    console.log(file.photoForm);
    this.apiService.upload(file,this.selectedAlbum,file.photoForm.value.title,file.photoForm.value.description).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          // this.fileInfos = this.uploadService.getFiles();
          this.files[idx].loaded = true;
          console.log(idx);
          console.log('reponse: ');
          console.log(event);
        }
        else{
          console.log(event);
        }
      },
      err => {
        console.log(err);
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
        this.files[this.files.length - 1].load = false;
        this.files[this.files.length - 1].photoForm = this.fb.group({
          title: files.item(i).name,
          description: ''
          });
      }
      reader.readAsDataURL(files.item(i));
    }
  }

  onAddFiles(event){
    if (event.target.files && event.target.files[0]) {
      this.onDrop(event.target.files);
    }
  }

  setSelectedAlbum(idAlbum){
    this.selectedAlbum = idAlbum;
  }

}
