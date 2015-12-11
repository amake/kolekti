$(document).ready(function() {
    CKEDITOR.disableAutoInline = true;
    // CKEDitor Behavior
    // The "instanceCreated" event is fired for every editor instance created.
    CKEDITOR.on( 'instanceCreated', function ( event ) {
	var editor = event.editor,
	    element = editor.element;
	
	// Customize editors for headers and tag list.
	// These editors do not need features like smileys, templates, iframes etc.
	// Customize the editor configuration on "configLoaded" event,
	// which is fired after the configuration file loading and
	// execution. This makes it possible to change the
	// configuration before the editor initialization takes place.
	editor.on( 'configLoaded', function () {
	    
	    // Remove redundant plugins to make the editor simpler.
	    editor.config.removePlugins = 'colorbutton,find,flash,font,' +
		'forms,iframe,newpage,removeformat,' +
		'smiley,specialchar,stylescombo,templates';
	    
	    // Rearrange the toolbar layout.
	    editor.config.toolbarGroups = [
		{ name: 'editing', groups: [ 'basicstyles', 'links', 'image' ] },
		{ name: 'undo' },
		{ name: 'clipboard', groups: [ 'selection', 'clipboard' ] },
		{ name :"paragraph", groups :['list','blocks']},
		{ name: 'about' }
	    ];
	    
	    editor.config.removeButtons='Strike,Anchor,Styles,Specialchar,CreateDiv,SelectAll'
	} );
	editor.on('change', function() {
	    editor.ecorse_state = true
	});
	editor.on( 'blur', function () {
	    if (editor.ecorse_state) {
		var release = $('.report').data('release')
		var topicid = $(editor.element.$).closest('.topic').attr('id')
		var data = editor.getData()
		$.ajax({
		    url:"/ecorse/report/analysis",
		    method:'POST',
		    data:$.param({
			'release': release,
			'topic' : topicid,
			'data':data
		    })
		}).done(function(data) {
		    if (data.status == 'ok') {
			editor.ecorse_state = false;
		    }
		}).fail(function(data) {
		});
		
	    }
	});
    } );
    

    // collapse : close open collapse when an otherone is open
    $(".collapseTopic").on('show.bs.collapse', function() {
	var current = $(this).attr('class')
	$(this).closest('.topicCollapses').find('.collapseTopic').removeClass('in')
/*	$(this).closest('.topicCollapses').find('.collapseTopic').each(function(){
	    if ($(this).attr('class') != current) {
		$(this).removeClass('in')
	    }
	})
*/ 
   })

    //collapse : highlight button
    $(".ecorse-action-collapse").on('click', function() {
	$(this).closest('.topicCollapses').find('.ecorse-action-collapse').removeClass('active')
	$(this).addClass('active')
    })
    
    // collapse : initialisation CKEditor sur déroulé
    $('.collapseAnalyse').on('shown.bs.collapse', function () {
	var editor, edid = $(this).find('.anaeditor').attr('id')
	if (CKEDITOR.instances[edid] == undefined)
	    editor = CKEDITOR.inline(edid,{startupFocus : true})
	else {
	    editor = CKEDITOR.instances[edid]
	    editor.focus()
	}
	editor.ecorse_state = false
    })
    
    // affichage diagrammes
    Chart.defaults.global.responsive = true;
    var chartcolors = ['220,51,51', '51,51,220', '51,220,61'];
    
    var make_chart  = function(chartid, kind, data) {
	var chart = document.getElementById(chartid)
	var canvasid = 'canvas_' + chartid
	$(chart).find('canvas').remove()
	$(chart).prepend($('<canvas>', {'id':canvasid}))
	
        for (s=0; s < data['seriescount']; s++) {
	    data['datasets'][s]["highlightStroke"] = "rgba("+chartcolors[s]+",1)";
  	    data['datasets'][s]["strokeColor"] = "rgba("+chartcolors[s]+",0.8)";
	    if (kind == "Bar") {
		data['datasets'][s]["highlightFill"] = "rgba("+chartcolors[s]+",0.75)";
 		data['datasets'][s]["fillColor"] = "rgba("+chartcolors[s]+",0.5)";
            }
	    if (kind == "Line") {
		data['datasets'][s]["highlightFill"] = "rgba("+chartcolors[s]+",0.2)";
 		data['datasets'][s]["fillColor"] = "rgba("+chartcolors[s]+",0.1)";
            }
	}
        var ctx = document.getElementById(canvasid).getContext("2d");
	var myNewChart = new Chart(ctx)[kind](data);
    }


    $('.section-content.collapse').on('shown.bs.collapse', function(e) {
	if ($(e.target).hasClass('section-content'))
	    $(this).find('.kolekti-sparql-result-chartjs').each(function() {
		var data = $(this).data('chartjs-data')
		var kind = $(this).closest('.topic').data('chart-kind')
		var parent   = $(this).attr('id')
		make_chart(parent, kind, data);
	    });
    })
    
    $('.kolekti-sparql-result-chartjs').each(function() {
	var data = $(this).data('chartjs-data')
	$(this).find('.legend').append(
	    $.map(data.datasets, function(s,i) {
		return $('<p>', {
			'class':'legendtiem',
		    'html':[
			$('<span>', {
			    'class':"legendcolor",
			    'html':$('<i>',{
				'class':"fa fa-square",
				'style':'color:rgba('+chartcolors[i]+',1)'
				
			    })
			}),
			$('<span>', {
			    'class':"legendtext",
			    'html':s.label
			})
		    ]
		} )
	    })
	)
    });

    // actions
    
    // Creation nouveau rapport
    
/*
    $('.ecorse-action-create-report').on('click', function() {
	$('#modal_create').show()
	$('.typeahead').typeahead()
    })
*/

    var ref_communes = {}

    $('.typeahead').typeahead({source:function(query, process) {
	var ref = $("#ecorse_select_referentiel").val();
	if (ref_communes.hasOwnProperty(ref))
	    return process(ref_communes[ref]);
	else {
	    $.get('/ecorse/communes',{'referentiel':ref})
		.done(function(data) {
		    ref_communes[ref] = data;
		    return process(data)
		})
	}
    }})

    $('#ecorse_select_referentiel').on('change', function() {
	$('.typeahead').val('')
    });
    
    // typeahead
    $('#modal_create').on('shown.bs.modal', function () {
	// recupere la liste des referentiels
	$.get('/ecorse/referentiels').done(function(data) {
	    $('#ecorse_select_referentiel').find('option').remove()
	    $(data).each(function(i,v) {
		$('#ecorse_select_referentiel').append(
		    $('<option>',{'value':v, 'html':v.replace('.html','')})
		);
	    });
	});
	$('.typeahead').each(function(){
	    $(this).val('')
	})
	$('#ecorse_select_referentiel').focus();

    })

    $('#modal_create_ok').on('click', function () {
	var referentiel = $("#ecorse_select_referentiel").val();
	var title = $('#titre_rapport').val()
	var commune1 = $('#commune1').typeahead("getActive")
	var commune2 = $('#commune2').typeahead("getActive")
	var commune3 = $('#commune3').typeahead("getActive")
	if (!commune1)
	    commune1 = {'id':''}
	if (!commune2)
	    commune2 = {'id':''}
	if (!commune3)
	    commune3 = {'id':''}

	$('#modal_create').hide()
	$('#modal_create_processing').show()
	$.ajax({
	    url:"/ecorse/report/create",
	    method:'POST',
	    data:$.param({
		'title': title,
		'toc': referentiel,
		'commune1':commune1.id,
		'commune2':commune2.id,
		'commune3':commune3.id
	    })
	}).done(function(data) {
	    if (data.length) {
		var url = window.location.origin + window.location.pathname + '?release=/releases/' + data[0].releasename 
		window.location.replace(url)
	    }
	}).fail(function(data) {
	});
    })
			     
    // Action globales sur le rapport
    // Actualisation des données
    $('.ecorse-action-update-data').on('click', function() {
	var release = $('.report').data('release')
	$('#modal_update_processing').show()
	$.ajax({
	    url:"/ecorse/report/update",
	    method:'POST',
	    data:$.param({
		'release': release
	    })
	}).done(function(data) {
	    if (data.status == 'ok') {
		window.location.reload(true)
	    }
	}).fail(function(data) {
	});
    })

    // Téléchargement (publication kolekti)
    $('.ecorse-action-dl-pdf').on('click', function() {
	var release = $('.report').data('release')
	$.ajax({
	    url:"/ecorse/report/publish",
	    method:'POST',
	    data:$.param({
		'release': release,
		'script': 'pdf'
	    })
	}).done(function(data) {
	}).fail(function(data) {
	});
	
    })
    $('.ecorse-action-dl-word').on('click', function() {
	var release = $('.report').data('release')
	$.ajax({
	    url:"/ecorse/report/publish",
	    method:'POST',
	    data:$.param({
		'release': release,
		'script': 'odt'
	    })
	}).done(function(data) {
	    console.log(data)
	    $.each(data, function(i,v) {
		console.log(v)
		if (v.event == 'result')
		    window.location.replace(window.location.origin + v.docs[0].url)
	    })
	}).fail(function(data) {
	});
	
    })
    $('.ecorse-action-dl-presentation').on('click', function() {
	var release = $('.report').data('release')
	$.ajax({
	    url:"/ecorse/report/publish",
	    method:'POST',
	    data:$.param({
		'release': release,
		'script': 'ppt'
	    })
	}).done(function(data) {
	}).fail(function(data) {
	});
	
    })
    $('.ecorse-action-dl-html').on('click', function() {
	var release = $('.report').data('release')
	$.ajax({
	    url:"/ecorse/report/publish",
	    method:'POST',
	    data:$.param({
		'release': release,
		'script': 'web'
	    })
	}).done(function(data) {

	}).fail(function(data) {
	});
	
    })

    // Actions sur les indicateurs
    // A la une (star)
    $('.ecorse-action-star').on('click', function() {
	var topic = $(this).closest('.topic')
	var state = !$(this).hasClass('btn-warning')
	var release = $('.report').data('release')
	var btn = $(this)
	$.ajax({
	    url:"/ecorse/report/star",
	    method:'POST',
	    data:$.param({
		'release': release,
		    'topic': topic.attr('id'),
		    'state': state
		})
	}).done(function(data) {
	    
	    if (data.status == 'ok') {
		if (state) {
		    btn.addClass('btn-warning')
		    btn.removeClass('btn-default')
		} else {
		    btn.addClass('btn-default')
		    btn.removeClass('btn-warning')
		}
	    }
	}).fail(function(data) {
	});
    })
    
    // masquer
    $('.ecorse-action-hide').on('click', function() {
	var topic = $(this).closest('.topic')
	var state = !$(this).hasClass('ishidden')
	var release = $('.report').data('release')
	var btn = $(this)
	$.ajax({
	    url:"/ecorse/report/hide",
	    method:'POST',
	    data:$.param({
		'release': release,
		'topic': topic.attr('id'),
		'state': state
	    })
	}).done(function(data) {
	    
	    if (data.status == 'ok') {
		if (state) {
		    topic.addClass("disabled")
		    btn.addClass('ishidden')
		    btn.removeClass('btn-default')
		} else {
		    topic.removeClass("disabled")
		    btn.addClass('ishidden')
		    btn.removeClass('btn-warning')
		}
	    }
	}).fail(function(data) {
	});
    })

	// selection graphique
    
    $('.ecorse-action-chart').on('click', function(e) {
	e.preventDefault()
	if(!$(this).find('i').length) {
	    var btn = $(this)
	    var charttype = $(this).attr('data-chart-type')
	    var topic = $(this).closest('.topic')
	    var release = $('.report').data('release')
	    
	    $.ajax({
		url:"/ecorse/report/chart",
		method:'POST',
		data:$.param({
		    'release': release,
		    'topic': topic.attr('id'),
		    'charttype': charttype
	    })
	    }).done(function(data) {
		
		if (data.status == 'ok') {
		    btn.closest('ul').find('i').remove();
		    btn.append($('<i>', { 'class':'fa fa-check'}));
		    topic.attr('data-chart-kind',charttype)
		    var chart = btn.closest('.thumbnail').find('.kolekti-sparql-result-chartjs')
		    var data = chart.data('chartjs-data')
		    var chartid   = chart.attr('id')
		    make_chart(chartid, charttype, data);
		    
		}
	    }).fail(function(data) {
	    });
	    
	}
    })
    
})
		  