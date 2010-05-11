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
				{ iconCls: 'icon-page_white', text: 'dodaj', handler: this.addExercise, scope: this }, '-', 
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
		if( this.window ) {
            this.window.toFront();
			this.window.getEl().frame();

            return false;
        }

        var form = new Seiho.gym.exercise.TrainingWizard({
            listeners: {
                validate: {
                    fn: function (form, valid, item, items_len) {
                        // set disabled when not valid or not last
                        this.window.buttons[2].setDisabled(!valid || !(item == items_len));
                    },
                    scope: this
                }
            }
        });

        this.window = new Seiho.Window({
            form: form,
            // ..
            title: 'Nowy Trening ...',
			iconCls: 'icon-page_white',
            maxWidth: 800,
            maxHeight: 500,
            layout: 'fit',
            items: form,
            listeners: {
                close: {
                    fn: function () {
                        this.window = undefined;
                    },
                    scope: this
                }
            },
            buttons: [
            	form.prevPanelAction, form.nextPanelAction, {
                	text: 'Zapisz',
	                iconCls: 'icon-save',
    	            //handler: this.saveTerm.createDelegate( this )
	            },
    	        {
        	        text: 'Anuluj',
	                iconCls: 'icon-delete',
    	            handler: function () {
        	            this.window.close()
            	    },
                	scope: this
	            }]
        });
        this.window.show();
	},
	deleteExercise: function() {
		// TODO implementacja
	}
});

Seiho.gym.exercise.TrainingWizard = Ext.extend( Seiho.wizard.BaseWizard, { //{{{
    initComponent: function () {
        Ext.apply(this, {
            items: [
	            new Seiho.gym.exercise.TrainingWizard.BaseInfo({
				    wizard: this
				}),
	            new Seiho.gym.exercise.TrainingWizard.Exercises({
				    wizard: this
			    }),
			]
        });
        Seiho.gym.exercise.TrainingWizard.superclass.initComponent.apply(this, arguments);
    }
});
//}}}
Seiho.gym.exercise.TrainingWizard.BaseInfo = Ext.extend( Seiho.wizard.Item, { //{{{
    startDate: new Date().clearTime(),
    stepName: 'Podstawowe dane o treningu',
    stepRawName: 'base_info',
    stepDescription: 'Uzupełnij podstawowe dane o treningu.',
    initComponent: function () {

        this.nameField = new Ext.form.TextField({
			name: 'name',
			flex: 1,
			allowBlank: false,
            value: 'Ćwiczenia na przedłużenie członka ' + new Date().format('Y-m-d H:i:s'),
            listeners: {
                blur: this.validate.createDelegate(this)
            }
		});
 
		this.dateField = new Ext.form.DateField({
            name: 'date',
			allowBlank: false,
            value: this.startDate,
            listeners: {
                blur: this.validate.createDelegate(this)
            }
		});
	
		this.privateField = new Ext.form.Checkbox({
			name: 'private',
			fieldLabel: 'Prywatny',
			allowBlank: false,
			anchor: '100%'
        });

		this.baseElement = new Ext.FormPanel({
			autoScroll: true,
            border: false,
            bodyStyle: 'padding:25px 20px 0px 20px',
            //margins: '3 3 3 3',
            items: [{
                xtype: 'fieldset',
                title: 'Dane ewidencyjne',
                autoHeight: true,
				items: [
					{
						xtype: 'compositefield',
						fieldLabel: 'Nazwa, Data',
						anchor: '-10px',
						items: [
							this.nameField,
							this.dateField
						]
					},
					this.privateField
				]
            },{
                xtype: 'fieldset',
                title: 'Opis, Uwagi',
                autoHeight: true,
                layout: 'fit',
                items: {
                    xtype: 'textarea',
                    name: 'description',
                    height: 200,
                    hideLabel: true,
                    listeners: {
                        blur: this.validate.createDelegate( this )
                    }
                }
            }]
        });
        Seiho.gym.exercise.TrainingWizard.BaseInfo.superclass.initComponent.apply( this, arguments );
    },

    isValid: function () {
        return this.baseElement.getForm().isValid()
    },

    getValues: function () {
        return this.baseElement.getForm().getValues();
    }

});
//}}}
Seiho.gym.exercise.TrainingWizard.Exercises = Ext.extend( Seiho.wizard.Item, { //{{{
    stepName: 'Ćwiczenia w sesji treningowej',
    stepRawName: 'exercises',
    stepDescription: 'Wybierz ćwiczenia wykonane w tej sesji treningowej.',
    initComponent: function () {

		this.dropPanel = new Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel({
			region: 'center',
			margins: '1 1 1 1'
		})

		this.baseElement = new Ext.Panel({
			border: false,
			layout: 'border',
			bodyStyle: 'background: white', 
			items: [
				this.dropPanel, new Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox({
					region: 'west',
					width: 150,
					border: false,
					margins: '1 1 1 1'
				})
			]
		});
	
		this.buttonClear = new Ext.Button({
			disabled: true,
			text: 'Wyczyść',
			iconCls: 'icon-world_delete',
			handler: this.clear,
			scope: this
		});

		Ext.apply( this, {
			fbar: [
				'->', this.buttonClear, ' '
			]
		});

		Seiho.gym.exercise.TrainingWizard.Exercises.superclass.initComponent.apply( this, arguments );
		/*
		this.dropPanel.exercises.on( 'clear'  , this.updateButtons, this )
		this.dropPanel.exercises.on( 'remove' , this.updateButtons, this )
		this.dropPanel.exercises.on( 'add'    , this.updateButtons, this )
		this.dropPanel.exercises.on( 'replace', this.updateButtons, this )
		*/
    },

	isValid: function () {
		/*
		var items = this.dropPanel.exercises.items;
		if( items.length == 0 ) return false;

		for( var i = 0, len = items.length; i < len; i++ )
			if( items[i].series.length == 0 )
				return false

		return true
		*/
	   return false
    },

    getValues: function () {
		//return this.dropPanel.exercises.items;
		return []
	},
	clear: function() {
		//this.dropPanel.exercises.clear();
		//this.dropPanel.refresh();
	},
	updateButtons: function() {
		this.validate();
		// ..
		//this.buttonClear.setDisabled( this.dropPanel.exercises.getCount() == 0 )
	}

});
//}}}

Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox = Ext.extend( Ext.tree.TreePanel, {
	rootVisible: false,
	autoScroll: true,
	useArrows: true,
	enableDrag: true,
	collapseFirst: false,
	trackMouseOver: false,
	ddGroup: 'designer-canvas',
	initComponent: function() {
		this.loader = new Ext.tree.TreeLoader({
			directFn: django.templates.tree
		});
		this.root = {
			id: "troot",
			async: true,
			expanded: true,
			text: "troot"
		};

		Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox.superclass.initComponent.call( this );
		this.getSelectionModel().on( 'beforeselect', function( a, b ) {
			if( b && !b.isLeaf() ) {
				b.toggle();
				return false
			}
		});
	}
});

Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel = Ext.extend( Ext.Panel, {
	baseCls: 'canvas',
	frame: true,
	autoScroll: true,
	// TODO: wszystko do css'a
	tpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="exercise round-corners" style="margin: 5px; background: #eee; padding: 2px;height: 50px; -moz-box-shadow: 2px 2px 2px #ccc;">',
				'<div class="exercise-name" style="padding: 2px; font-weight: bold; color: white; font-size:1.3em; text-shadow: 2px 2px 2px #888;">{[xindex]}. {text}</div>',
				'<div class="exercise-series">',
					'<tpl for="series">',
						'<div class="set round-corners"><span class="number round-corners">{[xindex]}</span>5 x 100m</div>',
					'</tpl>',
				'</div>',
			'</div>',
		'</tpl>'
	),
	initComponent: function() {
		this.record = Ext.data.Record.create([
			{ name: 'id', type: 'int' },
			{ name: 'text' },
			{ name: 'series' }
		]);

		this.store = new Ext.data.Store({
			reader: new Ext.data.ArrayReader(
				{
					idIndex: 0
				},
				this.record
			)
		})

		/*
		this.exercises = new Ext.util.MixedCollection( false, function( e ) {
			return e.id
		});
		*/

	   Ext.apply( this, {
		   layout: 'fit',
		   items: this.dataView = new Ext.DataView({
		   store: this.store,
		   tpl: this.tpl,
		   autoHeight: true,
		   emptyText: 'Ni ma chuja ...',
		   itemSelector: 'div.exercise'
		})
	   })

		Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel.superclass.initComponent.apply( this, arguments )

		this.store.loadData([
			[1, 'test', [1, 2] ]	
		])
		
		this.on( 'render', function() {
			var self = this;
			this.dropZone = new Ext.dd.DropTarget( this.body.dom, {
				ddGroup: 'designer-canvas',
				notifyDrop: function( ddSource, e, data ) {
					self.addExercise( data.node )
		
					return true
				}
			})
		}, this )

		this.dataView.on( 'click', this.onNodeClick, this );
		
	},
	
	addExercise: function( node ) {
		this.store.add( 
			new this.record(
				{ id: node.attributes.id, 
				  text: node.attributes.text, 
				  series: [1, 2]
			  }
			)
		)
	},

	refresh: function() {

	},

	onNodeClick: function( dv, index, node, e ) {
		var record = dv.getRecord( node );
		alert( record.get( "text" ) )
	}
})
