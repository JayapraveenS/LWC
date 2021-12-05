import {
    LightningElement,
    track
} from 'lwc';
import getData from '@salesforce/apex/OrgData.getData';//own apex method
import updateRecord from '@salesforce/apex/OrgData.updateRecord';//own apex method
import DeleteRecord from '@salesforce/apex/OrgData.DeleteRecord';//own apex method
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ImperativeDataContainer extends LightningElement {
    @track firstHalf;
    @track secondHalf;
    @track contacts;
    edit = false;
    EditName;
    EditEmail;
    EditPhone;
    EdittingRecordId;
    index;
    connectedCallback() {
        getData().then(
                data => {
                    this.contacts = JSON.parse(JSON.stringify(data));
                    this.firstHalf = JSON.parse(JSON.stringify(data));
                }
            )
            .catch(
                fault => {
                    console.log(fault);
                }
            )
    }
    ctrlEdit(event) {
        if(event.target.name=='secHalf' && this.index!=undefined)
        {
           this.index= this.index + event.target.dataset.index + 1;
        }
        else
        {
            this.index = event.target.dataset.index;
        }
        this.firstHalf=this.contacts.slice(0,this.index);
        this.secondHalf=this.contacts.slice((Number(this.index)+1));
        this.EditName=this.contacts[this.index].LastName;
        this.EditPhone=this.contacts[this.index].Phone;
        this.EditEmail=this.contacts[this.index].Email;
        this.EdittingRecordId=this.contacts[this.index].Id;
        this.edit = true;
    }
    changed(event) {
        if (event.target.name == 'LastName'){
            this.contacts[this.index].LastName=event.target.value;
            this.EditName=event.target.value;
        } else if (event.target.name == 'Email') {
            this.contacts[this.index].Email=event.target.value;
            this.EditEmail=event.target.value;
        } else if (event.target.name == 'Phone') {
            this.contacts[this.index].Phone=event.target.value;
            this.EditPhone=event.target.value;
        }
    }
    ctrlSave() {
        if(!(this.EdittingRecordId==undefined|| this.EdittingRecordId==undefined || this.EditName == '' || this.EditEmail==''||this.EditPhone==''))
        {
        let cont='';
        cont+=this.EdittingRecordId;
        cont+='~'+this.EditName;
        cont+='~'+this.EditPhone;
        cont+='~'+this.EditEmail;
        this.edit=false;
        this.firstHalf=this.contacts;
        this.secondHalf=null;
        updateRecord({cont}).then(
            success=> 
            {
                
                this.dispatchEvent(new ShowToastEvent(
                    {
                        title:'Update',
                        message:'Success',
                        variant:'success'
                    }
                ));
            }
        ).catch(
            fault=> 
            {
                this.dispatchEvent(new ShowToastEvent(
                    {
                        title:'Update',
                        message:'Failed',
                        variant:'error'
                    }
                ));
                console.log('Some error'+JSON.stringify(fault));
            }
        );
        }
        else
        {
            this.dispatchEvent(new ShowToastEvent(
                {
                    title: 'Invalid parameters',
                    message:'Elements length at least equal to one',
                    variant:'error'
                }
            ))
        }
    }
    ctrlDelete(event){
        let recordId=this.contacts[event.target.dataset.index].Id;
       DeleteRecord({recordId}).then(
           success => 
           {
            this.dispatchEvent(this.dispatchEvent(new ShowToastEvent({
                title: 'Delete',
                message:
                'Success',
                variant:'success' 
            })));
            this.contacts.splice(event.target.dataset.index,1);
           }
       ).catch(
        fault => 
        {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Delete',
                message:
                JSON.parse(JSON.stringify(fault)).body.message,
                variant:'error' 
            }));
            
            console.log(JSON.parse(JSON.stringify(fault)).body.message);
        }
       );

    }
}
