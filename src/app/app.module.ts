import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { LoginComponent } from './modules/general/login/login.component';
import { AlbumComponent } from './modules/application/album/album.component';
import { HomeComponent } from './modules/general/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { PhotoComponent } from './components/photo/photo.component';
import { FileSizePipe } from './file-size.pipe';
import { DropzoneDirective } from './directives/dropzone.directive';
import { UploaderComponent } from './modules/application/uploader/uploader.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectalbumComponent } from './components/selectalbum/selectalbum.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { ToastrModule } from 'ngx-toastr';
import { PeopleComponent } from './modules/application/people/people.component';
import { AlbumgalleryComponent } from './modules/application/album/albumgallery/albumgallery.component';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    AlbumComponent,
    HomeComponent,
    GalleryComponent,
    PhotoComponent,
    FileSizePipe,
    DropzoneDirective,
    UploaderComponent,
    SelectalbumComponent,
    ClickStopPropagationDirective,
    PeopleComponent,
    AlbumgalleryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
