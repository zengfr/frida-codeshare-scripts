
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:623570576 @Hyupai/p2mais
setTimeout(() => {
    Java.perform(() => {
        Java.use("br.com.kerhkhd.Engine.Query")["sync_filmes$lambda$21"].implementation = function(q, u, p, c, j) {
            console.log("\n=== DETECTEI CHAMADA DO MÉTODO ===");
            
            // Loga todos os parâmetros strings
            console.log("🔑 Username:", u);
            console.log("🔒 Password:", p); 
            //console.log("📋 JSON Data:", j);
            
            // Loga o objeto callback (resumido)
            console.log("📞 Callback:", c ? c.toString() : "null");
            
            // Loga o objeto query (resumido)
            console.log("🔍 Query Object:", q ? q.getClass().getName() : "null");
            
            return this["sync_filmes$lambda$21"](q, u, p, c, j); // Chama original
        };
        
          Java.use("br.com.kerhkhd.Engine.Query")["sync_canais_categoria$lambda$4$lambda$2"].implementation = function(query, callback, jsonString) {
            console.log("\n=== CANAIS/CATEGORIA DETECTADO ===");
            
            // Log dos parâmetros principais
            console.log("📡 JSON Recebido:", jsonString);
            console.log("🔄 Callback:", callback ? callback.toString() : "null");
            console.log("🔍 Query Object:", query ? query.getClass().getName() : "null");
            
            // Se quiser logar campos específicos da query:
            // console.log("ID Lançamento:", query.id_lancamento.value);
            
            // Chama a implementação original
            return this["sync_canais_categoria$lambda$4$lambda$2"](query, callback, jsonString);
        };
        
         Java.use("br.com.kerhkhd.Engine.Query")["sync_filmes_categoria$lambda$7"].implementation = function(query, callback, jsonString) {
            console.log("\n=== FILMES/CATEGORIA HOOK ===");
            
            // Log básico dos parâmetros
            console.log("🎬 JSON Recebido:", jsonString);
            console.log("📞 Callback:", callback ? callback.toString() : "null");
            
            // Log adicional do objeto Query (opcional)
            if (query) {
                console.log("🔍 Query Object:");
                console.log("  - ID Lançamento:", query.id_lancamento.value || "null");
                console.log("  - FilmesX:", query.filmesx ? "Presente" : "Ausente");
            }
            
            // Se quiser inspecionar o JSON parseado (cuidado com JSONs muito grandes)
            try {
                const jsonObj = JSON.parse(jsonString);
                console.log("📊 Categorias encontradas:", Object.keys(jsonObj).length);
            } catch (e) {
                console.log("⚠️ Não foi possível parsear o JSON");
            }
            
            // Chama a implementação original
            return this["sync_filmes_categoria$lambda$7"](query, callback, jsonString);
        };
        
         Java.use("br.com.kerhkhd.Engine.Query")["sync_series$lambda$24"].implementation = function(q, cb, json) {
            console.log("\n=== SERIES (lambda24) ===");
            console.log("📺 Query:", q);
            console.log("📋 JSON:", json.substring(0, 100) + (json.length > 100 ? "..." : ""));
            console.log("📞 Callback:", cb);
            return this["sync_series$lambda$24"](q, cb, json);
        };
        
          Java.use("br.com.kerhkhd.Engine.Query")["sync_series_categoria$lambda$13"].implementation = function(q, cb, json) {
            console.log("\n=== SERIES/CATEGORIA (lambda13) ===");
            console.log("🏷️ Categoria:", q.id_lancamento.value);
            console.log("📋 JSON Size:", json.length, "bytes");
            return this["sync_series_categoria$lambda$13"](q, cb, json);
        };
        
         Java.use("br.com.kerhkhd.Engine.Query")["sync_canais$lambda$19"].implementation = function(q, user, pass, cb, json) {
            console.log("\n=== CANAIS (lambda19) ===");
            console.log("🔑 User:", user);
            console.log("🔒 Pass:", pass);
            console.log("📻 JSON Keys:", Object.keys(JSON.parse(json)).length);
            return this["sync_canais$lambda$19"](q, user, pass, cb, json);
        };
        
         Java.use("br.com.kerhkhd.Engine.Query")["sync_canais_categoria$lambda$4$lambda$2"].implementation = function(q, cb, json) {
            console.log("\n=== CANAIS/CATEGORIA (lambda4-lambda2) ===");
            console.log("📡 Categoria ID:", q.id_lancamento.value);
            console.log("📋 JSON Sample:", json.split(',')[0]);
            return this["sync_canais_categoria$lambda$4$lambda$2"](q, cb, json);
        };
        
          Java.use("br.com.kerhkhd.Engine.Query")["sync_desmembramento$lambda$10"].implementation = function(q, cb, json) {
            console.log("\n=== DESMEMBRAMENTO (lambda10) ===");
            console.log("🧩 Query Fields:", Object.keys(q.getClass().getDeclaredFields()));
            console.log("📦 JSON Data:", json.length > 200 ? "[...]" : json);
            return this["sync_desmembramento$lambda$10"](q, cb, json);
        };
        
        console.log("✅ Hook instalado com sucesso!");
    });
    
  

}, 500); // Delay de 0.5s
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:623570576 @Hyupai/p2mais
