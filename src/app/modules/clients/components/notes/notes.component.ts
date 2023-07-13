import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { EntityService } from '../../services/entity.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';

interface Note {
  title: string;
  description: string;
  dateTime: Date;
  isEdit: boolean;
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  @ViewChild('addNoteModal') addNoteModal: any;

  notes: any = [];
  selectedNote: any = null;
  newNoteTitle: string = '';
  newNoteDescription: string = '';
  searchText: any = '';
  filteredItems: any = []
  currentPage = 1;
  itemsPerPage = 3;
  userDetails: any = {};
  Query: any = {};
  isLoading: boolean = true;

  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private appMetaService: AppMetaCreationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private entityService: EntityService,
    private modalService: NgbModal
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.getAllNotes({user: this.userDetails.email});   
  }
  openNoteDetail(note: Note) {
    this.selectedNote = note;
  }

  deleteNote() {
    if (this.selectedNote) {
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'notes',
        "queryData": {}
      }
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          this.entityService.deleteEntityById(this.selectedNote._id, formData).subscribe((res: any) => {
            this.isLoading = false;
            if (res.status == 200) {
              Swal.fire('Note Successfully deleted!', '', 'success').then(() => {
                this.getAllNotes({user: this.userDetails.email});   
              })
            }
          }, (err: any) => {
            this.isLoading = false;
            this.errorHandlingService.errorAlertMsg(err);
          })
        }
      })
  
    }
  }


  openAddNoteModal() {
    this.modalService.open(this.addNoteModal);
  }

  closeAddNoteModal(modal: any) {
    modal.dismiss('Close click');
    this.clearAddNoteInputs();
  }

  clearAddNoteInputs() {
    this.newNoteTitle = '';
    this.newNoteDescription = '';
  }

  getAllNotes(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'notes',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        if(res?.data?.length > 0){
          this.notes = res?.data;
          this.selectedNote = null;
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onSave() {
    if (this.selectedNote) {
      this.selectedNote.isEdit = false;
      const id = this.selectedNote?._id;
      delete this.selectedNote._id
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'notes',
        "collectionData": this.selectedNote
      }
      this.isLoading = true;
      this.entityService.updateEntityById(id, formData).subscribe((res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          Swal.fire('Note Updated!', '', 'success');
        }
      }, (err: any) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      })
    }
  }

  onAddNotes() {
    if (this.newNoteTitle && this.newNoteDescription) {
      const newNote = {
        title: this.newNoteTitle,
        description: this.newNoteDescription,
        dateTime: new Date(),
        isEdit: false,
      };
      this.addNotesAPI(newNote);
    }
  }

  addNotesAPI(newNote:any){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'notes',
      "collectionData": {
        user: this.userDetails.email,
        ...newNote
      }
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        this.clearAddNoteInputs();
        Swal.fire('Note Updated!', '', 'success');
        this.getAllNotes({user: this.userDetails.email});
      }
    }, (err) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }
}
