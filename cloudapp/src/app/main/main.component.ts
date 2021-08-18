import { Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppRestService, CloudAppEventsService, Request, HttpMethod, 
  Entity, PageInfo, RestErrorResponse, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  pageEntities: Entity[];
  apiResult: any;
  showApiResult: boolean;

  
  loading: boolean = false;
  selectedEntity: Entity;
  displayEntities: any;


  constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService 
  ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);

  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  
  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
        
    this.displayEntities = this.pageEntities[0].type.includes('BIB_MMS');

  }


  entitySelected(event: MatRadioChange) {
    const value = event.value as Entity;
    let request: Request = {
      url: `/bibs/${value.id}/requests`,
      method: HttpMethod.GET,
      queryParams: {
        request_type: "HOLD",
        status: "history"
      }
    }
    this.loading = true;
    this.restService.call<any>(request)
    .pipe(finalize(()=>this.loading=false))
    .subscribe(
      result => this.apiResult = result,
      error => this.alert.error('Failed to retrieve entity: ' + error.message),
      () => this.setShowApiResult(),
  
    );
    
  }
   
  setShowApiResult(){
    if (this.apiResult.total_record_count > 0) {
      this.showApiResult = true;
    } else {
      this.showApiResult = false;
    }
  }


  clear() {
    this.apiResult = null;
    this.selectedEntity = null;
  }

}
