const fs = require('fs');
const path = require('path');

// ========================================
// SCRIPT DE LIMPEZA DE TRACKING DUPLICADO
// ========================================

console.log('\n🧹 INICIANDO LIMPEZA DE TRACKING...\n');

// Configuração de caminhos
const projectRoot = __dirname;
const backupDir = path.join(projectRoot, 'backup', new Date().toISOString().replace(/:/g, '-').split('.')[0]);

// Arquivos a serem modificados (CAMINHOS CORRIGIDOS)
const filesToModify = [
  {
    path: 'src/components/Layout.tsx',
    name: 'Layout.tsx',
    removeImport: true,
    removeGA4Script: true,
    removeCalls: []
  },
  {
    path: 'src/components/Landing.tsx',
    name: 'Landing.tsx',
    removeImport: true,
    removeGA4Script: false,
    removeCalls: [
      "tracking.pageView('landing')",
      "tracking.scrollDepth(50)",
      "tracking.ctaClicked('landing_primary')"
    ]
  },
  {
    path: 'src/components/Chat.tsx',
    name: 'Chat.tsx',
    removeImport: true,
    removeGA4Script: false,
    removeCalls: [
      "tracking.pageView('chat')",
      "tracking.chatStarted()",
      "tracking.questionAnswered(question.id, option)",
      "tracking.chatCompleted()",
      "tracking.ctaClicked('chat_complete')"
    ]
  },
  {
    path: 'src/components/Result.tsx',
    name: 'Result.tsx',
    removeImport: true,
    removeGA4Script: false,
    removeCalls: [
      "tracking.pageView('resultado')",
      "tracking.revelationViewed('why_left')",
      "tracking.vslEvent('started')",
      "tracking.revelationViewed('72h_window')",
      "tracking.revelationViewed('offer')",
      "tracking.ctaClicked('result_buy')"
    ]
  }
];

const fileToDelete = 'src/utils/tracking.ts';

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function createBackup() {
  console.log('📂 Criando backup...');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  let backupCount = 0;

  // Backup dos arquivos a modificar
  filesToModify.forEach(file => {
    const filePath = path.join(projectRoot, file.path);
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(backupDir, file.name + '.backup');
      fs.copyFileSync(filePath, backupPath);
      backupCount++;
    }
  });

  // Backup do tracking.ts
  const trackingPath = path.join(projectRoot, fileToDelete);
  if (fs.existsSync(trackingPath)) {
    const backupPath = path.join(backupDir, 'tracking.ts.backup');
    fs.copyFileSync(trackingPath, backupPath);
    backupCount++;
  }

  console.log(`✅ Backup criado: ${backupDir}`);
  console.log(`✅ ${backupCount} arquivos salvos no backup\n`);
}

function removeImportLine(content) {
  // Remove a linha de import do tracking
  const importRegex = /import\s*{\s*tracking\s*}\s*from\s*['"]\.\.\/utils\/tracking['"];?\s*\n?/g;
  return content.replace(importRegex, '');
}

function removeGA4ScriptFromLayout(content) {
  // Remove o bloco completo do GA4 manual no Layout.tsx
  const ga4BlockRegex = /\/\/ ={40,}\s*\/\/ ✅ GOOGLE ANALYTICS 4 \(GA4\)\s*\/\/ ={40,}\s*const ga4Script[\s\S]*?console\.log\("✅ Pixels carregados: Utmify Pixel, Utmify UTM, GA4"\);/g;
  
  let newContent = content.replace(ga4BlockRegex, '');
  
  // Fallback: remove linhas individuais se o bloco não for encontrado
  if (newContent === content) {
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      return !line.includes('ga4Script') &&
             !line.includes('ga4ConfigScript') &&
             !line.includes('gtag/js?id=G-G6B4TMDNTK') &&
             !line.includes('window.dataLayer') &&
             !line.includes("gtag('js'") &&
             !line.includes("gtag('config', 'G-G6B4TMDNTK')");
    });
    newContent = filteredLines.join('\n');
  }
  
  return newContent;
}

function removeTrackingCalls(content, calls) {
  let newContent = content;
  let removedCount = 0;

  calls.forEach(call => {
    // Cria regex para encontrar a linha completa com a chamada
    const callRegex = new RegExp(`\s*${call.replace(/[()]/g, '\$&')}\s*;?\s*\\n?`, 'g');
    const beforeRemove = newContent;
    newContent = newContent.replace(callRegex, '');
    
    if (beforeRemove !== newContent) {
      removedCount++;
    }
  });

  return { content: newContent, removedCount };
}

function processFile(fileConfig) {
  const filePath = path.join(projectRoot, fileConfig.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileConfig.name}: Arquivo não encontrado em ${fileConfig.path}`);
    return { success: false, removedLines: 0 };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let totalRemoved = 0;

  // Remove import
  if (fileConfig.removeImport) {
    const beforeRemove = content;
    content = removeImportLine(content);
    if (beforeRemove !== content) {
      totalRemoved++;
      console.log(`  ❌ Removido: import { tracking }`);
    }
  }

  // Remove script GA4 manual (apenas Layout.tsx)
  if (fileConfig.removeGA4Script) {
    const beforeRemove = content;
    content = removeGA4ScriptFromLayout(content);
    if (beforeRemove !== content) {
      totalRemoved += 3; // Conta como 3 linhas (script + config + log)
      console.log(`  ❌ Removido: Script GA4 manual (gtag.js)`);
    }
  }

  // Remove chamadas tracking.xxx()
  if (fileConfig.removeCalls.length > 0) {
    const result = removeTrackingCalls(content, fileConfig.removeCalls);
    content = result.content;
    totalRemoved += result.removedCount;
    if (result.removedCount > 0) {
      console.log(`  ❌ Removidas ${result.removedCount} chamadas tracking.xxx()`);
    }
  }

  // Salva o arquivo modificado
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✅ Arquivo salvo\n`);

  return { success: true, removedLines: totalRemoved };
}

function deleteTrackingFile() {
  const trackingPath = path.join(projectRoot, fileToDelete);
  
  if (!fs.existsSync(trackingPath)) {
    console.log(`⚠️  tracking.ts: Arquivo não encontrado (já foi deletado?)\n`);
    return false;
  }

  fs.unlinkSync(trackingPath);
  console.log(`❌ tracking.ts: Arquivo deletado`);
  console.log(`  ✅ Backup salvo em: ${backupDir}\n`);
  return true;
}

// ========================================
// EXECUÇÃO PRINCIPAL
// ========================================

try {
  // 1. Criar backup
  createBackup();

  // 2. Processar arquivos
  console.log('🔧 Aplicando modificações...\n');
  
  let totalFilesModified = 0;
  let totalLinesRemoved = 0;

  filesToModify.forEach(fileConfig => {
    console.log(`📝 ${fileConfig.name}:`);
    const result = processFile(fileConfig);
    if (result.success) {
      totalFilesModified++;
      totalLinesRemoved += result.removedLines;
    }
  });

  // 3. Deletar tracking.ts
  console.log(`📝 tracking.ts:`);
  const trackingDeleted = deleteTrackingFile();

  // 4. Relatório final
  console.log('━'.repeat(50));
  console.log('\n📊 RELATÓRIO FINAL:\n');
  console.log(`  ✅ Arquivos modificados: ${totalFilesModified}`);
  console.log(`  ✅ Arquivos deletados: ${trackingDeleted ? 1 : 0}`);
  console.log(`  ✅ Linhas removidas: ${totalLinesRemoved}`);
  console.log(`  ✅ Backup criado: ${backupDir}\n`);

  console.log('🎯 PRÓXIMOS PASSOS:\n');
  console.log('  1. Execute: npm run dev');
  console.log('  2. Verifique se não há erros no console');
  console.log('  3. Teste o funil completo (Landing → Chat → Result)');
  console.log('  4. Abra DevTools (F12) e verifique eventos GA4');
  console.log('  5. Se tudo OK, prossiga para instalação do GTM\n');

  console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!\n');

  console.log('💡 DICA: Se algo der errado, restaure o backup:');
  console.log(`   cp ${backupDir}/* src/components/`);
  console.log(`   cp ${backupDir}/tracking.ts.backup src/utils/tracking.ts\n`);

} catch (error) {
  console.error('\n❌ ERRO DURANTE A LIMPEZA:');
  console.error(error.message);
  console.error('\n💡 Restaure o backup manualmente:');
  console.error(`   cp ${backupDir}/* src/components/`);
  console.error(`   cp ${backupDir}/tracking.ts.backup src/utils/tracking.ts\n`);
  process.exit(1);
}