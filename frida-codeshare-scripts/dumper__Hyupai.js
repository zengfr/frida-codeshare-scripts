
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1404958967 @Hyupai/dumper
Java.perform(function() {
    try {
        // Hookeando todas as classes do pacote
        var classes = Java.enumerateClassesSync('com.mm.droid.livetv*'); // Wildcard para pegar qualquer classe do pacote
        classes.forEach(function(className) {
            try {
                var clazz = Java.use(className);
                console.log('Hookeando métodos da classe: ' + className);
                
                // Hookeando todos os métodos da classe
                var methods = clazz.class.getDeclaredMethods();
                methods.forEach(function(method) {
                    try {
                        var methodName = method.getName();
                        console.log('Método encontrado: ' + methodName);
                        clazz[methodName].implementation = function() {
                            console.log('Método chamado: ' + methodName);
                            return this[methodName].apply(this, arguments); // Chama o método original
                        };
                    } catch (e) {
                        console.log('Erro ao hookear o método: ' + e);
                    }
                });
            } catch (e) {
                console.log('Erro ao hookear a classe: ' + e);
            }
        });
    } catch (e) {
        console.log('Erro ao listar classes: ' + e);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1404958967 @Hyupai/dumper
eshare-scripts QQGroup: 143824179 .
//hash:-1581263712 @Hyupai/dumper
