Ext.namespace( 'Seiho.gym.exercise' );

Seiho.gym.exercise.MainPanel = Ext.extend( Ext.grid.GridPanel, {
	initComponent: function() {

		var xg = Ext.grid;

		var experienceStore = new Ext.data.GroupingStore({
			groupField: 'date',
			proxy: new Ext.data.DirectProxy({
				directFn: django.exercises.list
			}),
			reader: new Ext.data.JsonReader({
				root: 'records',
				fields: [
					{name: 'id'},
					{name: 'template_name'},
					{name: 'template_type'},
					{name: 'sets'},
					{name: 'date', type: 'date', dateFormat: 'Y-m-d h:i:s'},
				]
			})
		});

		Ext.apply( this, {
			store: experienceStore,
			loadMask: { msg: 'Czekaj <b>koksie</b>, trwa wczytywanie twoich treningów ...'},
			columns: [
				{
					id:'tn',
					header: "Nazwa", 
					sortable: true, 
					dataIndex: 'template_name',  
					renderer: function( v ) {
						// TODO wygląd
						return v
					}
				},
				{header: "Typ", width: 20, sortable: true, dataIndex: 'template_type', align: 'center' },				
				{
					header: "Serie", 
					width: 5, 
					sortable: true, 
					dataIndex: 'sets',
					align: 'center',
					renderer: function( v ) { 
						var sets = Ext.util.JSON.decode( v );
						return '<div class="round-corners" style="background: #cccccc; font-weight: bold; color: white">' + sets.length + '</div>'
					}
				},
				{header: "Data", width: 20, align: 'center', sortable: true, renderer: Ext.util.Format.dateRenderer( 'l, j F Y' ), dataIndex: 'date'}
			],

			view: new Ext.grid.GroupingView({
				emptyText: 'Brak danych treningowych. Zacznij ćwiczyć ...',
				forceFit:true,
				hideGroupedColumn: true,
				groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Elementów" : "Element"]})',
				enableRowBody: true,
				showPreview: true,
				getRowClass: function( record, rowIndex, rp, ds ) {
					if( this.showPreview ) {
						var sets = Ext.util.JSON.decode( record.get( 'sets' ) );
						// TODO: template
						var items = '';
						for( var i = 0, len = sets.length; i < len; i++ ) {
							var mass = sets[i].fields.mass;
							var time = sets[i].fields.time;
							var reps = sets[i].fields.reps;
							var number = sets[i].fields.number;
							var distance = sets[i].fields.distance;
	
							var info = ( reps > 0 ? '<span class="biggest">' + reps + '</span> powtórzeń' : '' ) + ( mass > 0 ? ' x <span class="biggest">' + mass + '</span> kg ' : '' ) + ( distance > 0 ? ' <span class="biggest">' + distance + '</span> m' : '' ) + ( time != '00:00:00' ? ' <span class="biggest">' + time + '</span>' : '' )
	
							items += '<div class="set round-corners"><span class="number round-corners">' + number + '</span> ' + info + '</div>'
						}
	
						rp.body = '<div class="exercise-bodyrow">' + items + '</div>'
					}
					return 'x-grid3-row-expanded'
				}
			}),
			title: 'Dziennik treningowy',
			iconCls: 'icon-grid',
			tbar: [
				' ', { xtype: 'textfield', width: 250, emptyText: 'Wyszukaj w dzienniku ...' },
				'->', 
				{ iconCls: 'icon-page_white', text: 'dodaj' }, '-', 
				{ iconCls: 'icon-page_white_edit', text: 'edytuj', disabled: true },
				{ iconCls: 'icon-delete', text: 'usuń', disabled: true },
				'-',
				{ iconCls: 'icon-common', text: 'szczegóły serii', enableToggle: true, pressed: true, toggleHandler: this.toggleSeries, scope: this },
				' '
			]
		});

		Seiho.gym.exercise.MainPanel.superclass.initComponent.apply( this, arguments );
		
		this.on( 'render', function() {
			experienceStore.load()			
		}, this, { delay: 100 } );
	},
	toggleSeries: function( btn, pressed ) {
		var view = this.getView();
		view.showPreview = pressed;
		view.refresh();
	},
	addExercise: function() {
		// TODO implementacja
	},
	deleteExercise: function() {
		// TODO implementacja
	}
});
