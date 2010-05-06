Ext.namespace( 'Seiho.wizard' );

Seiho.wizard.BaseWizard = Ext.extend( Ext.Panel, {//{{{

	border       : false,

	activeItem   : 0,	

	initComponent: function() {

		/**
		 * @event validate
		 * Fires after the form has been validated.		 
		 * @param {Seihosoft.module.deliverersPriceList.PriceListForm} this.
		 * @param {Boolean} true if valid else false.
		 */		
		 this.addEvents( 'validate' );		

		 var cachedActiveItem = this.activeItem;

		 this.prevPanelAction = new Ext.Action({
			 text    : '&laquo; Poprzedni Krok',
			 handler : this.navigatePrev.createDelegate( this ),
			 disabled: true
		 });

		 this.nextPanelAction = new Ext.Action({
			 text   : 'Następny Krok &raquo;',
			 handler: this.navigateNext.createDelegate( this )
		 });

		 Ext.apply( this, {
			 layout    : new Ext.layout.CardLayout({
				 deferredRender: true
			 }),			 
			 defaults  : {
				 border: false
			 }
		 });

		 Seiho.wizard.BaseWizard.superclass.initComponent.apply( this, arguments );

		 this.activeItemId = cachedActiveItem;
	 },

	 render    : function() {
		 Seiho.wizard.BaseWizard.superclass.render.apply( this, arguments );
		 // ..
		 this.navigateTo( this.activeItemId )
		 this.doValidation();
	 },

	 navigateNext: function() {
		 this.navigateTo( this.activeItemId + 1 );
	 },

	 navigatePrev: function() {		
		 this.navigateTo( this.activeItemId - 1 );
	 },	

	 navigateTo  : function( itemNumber) {

		 this.nextPanelAction.setDisabled( true/*this.items.length == itemNumber + 1*/ );
		 this.prevPanelAction.setDisabled( itemNumber == 0 );
		 this.activeItemId = itemNumber;

		 // remove old listener
		 if( this.lastActiveComponent ) {
			 this.lastActiveComponent.removeListener( 'validate', this.onComponenentValidate, this );
		 }

		 var layout = this.getLayout();
		 layout.setActiveItem( itemNumber );

		 // add listener
		 this.lastActiveComponent = this.getComponent( itemNumber );
		 this.lastActiveComponent.on( 'validate', this.onComponenentValidate, this );
		 this.lastActiveComponent.validate();
	 },

	 doValidation: function( dirty) {
		 var valid = true;
		 for( var i=0; i<this.items.length; i++ ) {
			 if( !this.getComponent( i ).isValid() ) {
				 valid = false;
			 }
		 }

		 this.fireEvent( 'validate', this, valid, this.activeItemId, this.items.length - 1 );
	 },

	 // private
	 onComponenentValidate: function( c, valid ) {
		 this.nextPanelAction.setDisabled( this.items.length == this.activeItemId + 1 || !valid );
		 this.doValidation();
	 },

	 getValues: function() {
		 var result = {};
		 for ( var i = 0; i < this.items.length; i++ ) {
			 var item = this.getComponent( i );
			 result[ item.stepRawName ] = item.getValues();
		 }
		 return result;
	 },
	 
	 getValue: function( key ) {
		 for ( var i = 0; i < this.items.length; i++ ) {
			 var item = this.getComponent( i );
			 if( item.stepRawName == key ) {
				 return item.getValues();
			 }
		 } 
		 return null;
	 }
 });
 //}}}

 Seiho.wizard.Item = Ext.extend( Ext.Panel, {//{{{

	 isValid        : Ext.emptyFn,	 

	 stepName       : 'Select ...',

	 stepRawName    : 'step1',

	 stepDescription: 'Basic Step',

	 baseElement    : new Ext.Panel({
		 html  : 'test',
		 border: false
	 }),

	 initComponent: function() {

		 this.addEvents( 'validate' );	

		 this.baseElement.region = 'center'

		 this.headerElement = new Ext.Panel({
			 region   : 'north',
			 //margins  : '3 3 3 3',
			 border   : false,
			 height   : 50,
			 bodyStyle: 'padding:10px',
			 html     : '<h1>' + this.stepName + '</h1><p>' + this.stepDescription + '</p>'
		 });

		 Ext.apply( this, {
			 layout: 'border',
			 items : [
				 this.headerElement,
				 this.baseElement
			 ]
		 });
		 Seiho.wizard.Item.superclass.initComponent.apply( this, arguments );
	 },

	 validate: function( nodirty ) {
		 this.fireEvent( 'validate', this, this.isValid() );
	 }
 });
 //}}}

 // vim: fdm=marker ts=4 sw=4 sts=4
