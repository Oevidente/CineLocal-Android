# Correção Definitiva de Classes Duplicadas do Kotlin no Build do APK Android

Plano revisado com base no log exato do erro reportado: `Execution failed for task ':app:checkDebugDuplicateClasses'` com classes duplicadas entre `kotlin-stdlib-1.8.22` e `kotlin-stdlib-jdk8-1.6.21` / `kotlin-stdlib-jdk7-1.6.21`.

### Revisão do Usuário & Diagnóstico Exato

> [!IMPORTANT]
> **Causa Raiz Exata Identificada:**
> 56 tarefas do build foram executadas com sucesso até a tarefa `:app:checkDebugDuplicateClasses`.
> A partir do Kotlin 1.8.0, os pacotes `kotlin-stdlib-jdk7` e `kotlin-stdlib-jdk8` foram unificados dentro do `kotlin-stdlib`. Como dependências legadas ou plugins do Capacitor trazem versões antigas transitivas (`1.6.21`), o Android Gradle Plugin detecta classes repetidas (`CollectionsJDK8Kt`, `JDK8PlatformImplementations`, `JDK7PlatformImplementations`) e aborta a montagem do APK.

- **Status da Compilação**: O ambiente Android SDK e ferramentas já estão 100% funcionando (56 tarefas executadas). Resta exclusivamente resolver a colisão das classes do Kotlin.
- **Solução Padronizada**: Excluir transitivamente os módulos redundantes `kotlin-stdlib-jdk7` e `kotlin-stdlib-jdk8` em todas as configurações do Gradle e forçar o alinhamento da biblioteca Kotlin via `kotlin-bom:1.8.22` e `resolutionStrategy`.

---

### 1. Visão Geral da Solução

- **O que faz**:
  1. No `android/app/build.gradle`:
     - Adiciona exclusão global de `kotlin-stdlib-jdk7` e `kotlin-stdlib-jdk8` em `configurations.configureEach`.
     - Declara `implementation(platform("org.jetbrains.kotlin:kotlin-bom:1.8.22"))` para alinhar todas as dependências Kotlin à mesma versão única.
  2. No `android/build.gradle`:
     - Configura `resolutionStrategy` com `force` para unificar quaisquer versões legadas do Kotlin em todos os subprojetos.
  3. No `.gitignore` e workflow:
     - Mantém a limpeza e garantia de isolamento do runner.

---

### 2. Fluxo da Resolução de Dependências

```
Dependências do App / Capacitor / Plugins
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│               Gradle Resolution Strategy               │
├────────────────────────────────────────────────────────┤
│ • kotlin-bom: 1.8.22                                   │
│ • Excluir: kotlin-stdlib-jdk7 / kotlin-stdlib-jdk8     │
│ • Manter apenas: org.jetbrains.kotlin:kotlin-stdlib    │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│            checkDebugDuplicateClasses                  │
│            ──► Sucesso (0 classes duplicadas)          │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│                 Geração do APK Final                   │
│          CineLocal-Android.apk compilado               │
└────────────────────────────────────────────────────────┘
```

---

### 3. Alterações Técnicas Concretas

1. **`android/app/build.gradle`**:
   ```groovy
   configurations.configureEach {
       exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
       exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
   }
   
   dependencies {
       implementation(platform("org.jetbrains.kotlin:kotlin-bom:1.8.22"))
       // ... demais dependencias
   }
   ```
2. **`android/build.gradle`**:
   ```groovy
   allprojects {
       configurations.all {
           resolutionStrategy {
               force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
               force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
               force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
           }
       }
   }
   ```

---

### 4. Próximos Passos Imediatos após Aprovação

- Aplicar as regras de exclusão e `kotlin-bom` em `android/app/build.gradle` e `android/build.gradle`.
- Garantir que `.gitignore` ignore `.gradle/` local.
- Sincronizar o projeto com `npm run build && npx cap sync android`.
- Validar a compilação do applet para commit e geração do APK no GitHub Actions.
