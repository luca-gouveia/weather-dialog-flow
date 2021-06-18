angular.module('WeatherApp', [])
.controller('ctrl', function ($scope, $http, $interval){
    const vm = $scope;
    
    var dfMessenger = document.querySelector('df-messenger');
    var payload =  null;
    var queryInput = null;
    
    vm.dados = '';
    vm.result ='';
    vm.localidade = "Natal";
    vm.horaAtual = '--:--:--';
    vm.carregarDados = false;

    active();

    vm.init = function() {
        console.log("init...");
        vm.carregarClima();
    };


    function active() {
        vm.callAtInterval = function(){
            var today = new Date();
            var horas = today.getHours();
            var minutos = today.getMinutes();
            var segundos = today.getSeconds();

            horas = (horas.toString().length === 1) ? '0'+horas : horas;
            minutos = (minutos.toString().length === 1) ? '0'+minutos : minutos;
            segundos = (segundos.toString().length === 1) ? '0'+segundos : segundos;

            vm.horaAtual = `${horas}:${minutos}:${segundos.toString()}`;
        }
    
        $interval(vm.callAtInterval, 1000);
    };


    vm.execute = function () {
        if(vm.dados){
            var coord = (vm.dados.coord.lat+'|'+vm.dados.coord.lon);
        }

        if(queryInput){
            if(queryInput.text === '1'){
                vm.exibirMapa();
            } else if(queryInput.text === '2'){
                vm.buscarWiki(coord, function (){
                    vm.exibirDescricao();
                });
            } else if(queryInput.text === '3'){
                vm.buscarWiki(coord, function (){
                    vm.exibirImagem();
                });
            } else if(queryInput.text === '4'){
                vm.exibirClima();
            }
        }
    };

    vm.exibirClima = function () {
        payload = [
            {
                "type": "description",
                "title": vm.dados.name,
                "text": [
                    `Coordenadas: lat: ${vm.dados.coord.lat} / log: ${vm.dados.coord.lon}
                     Temperatura: ${vm.dados.main.temp} 
                     Sensação térmica: ${vm.dados.main.feels_like}
                     Mínima: ${vm.dados.main.temp_min}
                     Máxima: ${vm.dados.main.temp_max}
                     Humidade: ${vm.dados.main.humidity}% 
                     Velocidade do vento: ${vm.dados.wind.speed}                    
                    `
                ]
            }
        ]
        dfMessenger.renderCustomCard(payload);

        console.log('set payload',new Date().getTime());
    };

    vm.exibirDescricao = function () {
        payload = [
            {
                "type": "description",
                "title": vm.result.title,
                "text": [
                  vm.result.extract
                ]
            }
        ]
        dfMessenger.renderCustomCard(payload);

        console.log('set payload',new Date().getTime());
    };

    vm.exibirImagem = function () {
        payload = [
            {
                "type": "image",
                "rawUrl": vm.result.thumbnail.source,
                "accessibilityText": vm.result.pageimage
            }
        ];

        dfMessenger.renderCustomCard(payload);

        console.log('set payload',new Date().getTime());
    };

    vm.exibirMapa = function () {
        var url = 'https://www.google.com/maps/search/?api=1&query=';
        var params = (vm.dados.coord.lat +','+vm.dados.coord.lon);

        payload = [
            {
                "type": "info",
                "title": "Mapa | "+vm.dados.name,
                "subtitle": "Acessar mapa",
                "image": {
                    "src": {
                    "rawUrl": "https://image.flaticon.com/icons/png/512/2642/2642502.png"
                    }
                },

                "actionLink": url+params
            }
        ];

        dfMessenger.renderCustomCard(payload);
    };

    vm.sincronizar = function () {
        var currentdate = new Date(); 
        vm.sync = "Sincronizado: " 
        + currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/" 
        + currentdate.getFullYear() + " - "  
        + currentdate.getHours() + ":"  
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds();
    };

    // AJAX
    vm.carregarClima = function() {
        var apiKey = '&appid='+'5a8ee274846ac36f4be406c70e2172e9';
        var localidade = vm.localidade;
        var api = 'http://'+'api.openweathermap.org/data/2.5/weather?q=';
        var params = '&lang=pt_br&units=metric';
        $http({
            url: api + localidade + params + apiKey,
            method: 'GET'
        }).then(function(resp) {
            vm.dados = resp.data;
            vm.sincronizar();
            vm.carregarDados = true;
            console.log(vm.dados);
        }).catch(function(){
            alert("Não foi possível carregar o clima...");
        })
    }

    vm.buscarWiki = function(search, callback){
        vm.result = '';
        $http.jsonp('https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|description|extracts&generator=geosearch&ggsradius=10000&ggscoord='+search+'&exintro&explaintext&redirects=1&format=json&redirects=1&ggslimit=1&pithumbsize=500')
        .then(function(res){
            vm.result = Object.entries(res.data.query.pages)[0][1];
            console.log(vm.result);
        })
        .catch(function(){
            console.log('Não foi possível recuperar dados da WIKI');
        }).finally(
            callback
        );
    }

    dfMessenger.addEventListener('df-request-sent', function (event) {
        queryInput = event.detail.requestBody.queryInput.text;
        vm.execute();
    });
}).config(function($sceProvider) {$sceProvider.enabled(false);});