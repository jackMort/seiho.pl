Ext.namespace( 'Seiho' );

Seiho.Window = Ext.extend( Ext.Window, {	
	minWidth: 300,
	minHeight: 300,
	maxWidth: 10000,
	maxHeight: 10000,
	topSpace: 30,
	leftSpace: 30,
	initComponent: function() {
		Ext.apply( this, {
			width: Math.min( this.maxWidth, Math.max( window.innerWidth - this.leftSpace, this.minWidth ) ),
			height: Math.min( this.maxHeight, Math.max( window.innerHeight - this.topSpace, this.minHeight ) )
		});
		Seiho.Window.superclass.initComponent.apply( this, arguments );
	}
});
