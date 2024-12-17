class StandardFields{
    protected id: string = '';
    protected created_at:Date = new Date(); 
    getId(){return this.id;};
    getCreateDateTime(){return this.created_at;};
    setId(nId:string){this.id = nId;};
    setCreateDateTime(nCreated_at:Date){this.created_at = nCreated_at};
}

class HystoricalFields{
    protected action: string = 'insert';
    protected revision: string = '';
    protected revisor: string = '';
    protected changed_at:Date = new Date(); 
    getAction(){return this.action;};
    getRevision(){return this.revision;};
    getRevisor(){return this.revisor;};
    getChangeDateTime(){return this.changed_at;};
}


export {StandardFields, HystoricalFields}
