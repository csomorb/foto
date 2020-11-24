import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  defaultSelectedIdAlbum: number;
  files = [];
  totalSize: number;
  totalUploadedSize: number;

  constructor(private apiService: ApiService,private fb: FormBuilder, private route: ActivatedRoute,private toast: ToastrService) {
  }

  uploadFiles() {
    this.message = '';
    if (!this.selectedAlbum){
      this.message = 'Veuillez sélectionner un album';
      return;
    }

    for (let i = 0; i < this.files.length; i++) {
      console.log(this.files[i])
      if (!this.files[i].loaded){
        this.files[i].loading = true;
        this.files[i].uploadProgress = 0;
        this.files[i].uploadedSize = 0;
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
          console.log(event.total);
          this.files[idx].uploadProgress = Math.round(100 * event.loaded / event.total);
          this.files[idx].uploadedSize = event.loaded;
          this.totalUploadedSize = this.files.reduce( (x, f) => f.uploadedSize + x, 0);
        } else if (event instanceof HttpResponse) {
          // this.fileInfos = this.uploadService.getFiles();
          this.toast.success('Uploaded',
          event.body.originalFileName,
          {timeOut: 2000,});
          this.files[idx].loaded = true;
          // this.files[idx].loading = false;
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
        this.files[idx].uploadProgress = 0;
        this.files[idx].uploadedSize = 0;
        this.files[idx].loading = false;
        this.progressInfos[idx].value = 0;
        this.toast.success(file.name,
        'Could not upload the file',
        {timeOut: 3000,});
      });
  }

  ngOnInit(): void {
    this.totalUploadedSize = 0;
    this.totalSize = 0;
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = parseInt(params.get('idAlbum'));
      if (id){
        this.defaultSelectedIdAlbum = id;
      }
      else{
        this.defaultSelectedIdAlbum = 0;
      }
    });
  }

  deleteFile(filename){
    this.files.splice(this.files.findIndex( f => f.name === filename),1);
    this.totalSize = this.files.reduce( (x, f) => f.size + x, 0);
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onload = (even:any) => {
        //TODO : a délocaliser quand visible dans le viewport
        this.files.push(files.item(i));
        this.files[this.files.length - 1].data = even.target.result;
        this.files[this.files.length - 1].loaded = false;
        this.files[this.files.length - 1].loading = false;
        this.files[this.files.length - 1].photoForm = this.fb.group({
          title: files.item(i).name,
          description: ''
          });
      }
      this.totalSize += files[i].size;
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
