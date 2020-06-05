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

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    AlbumComponent,
    HomeComponent,
    GalleryComponent,
    PhotoComponent,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
