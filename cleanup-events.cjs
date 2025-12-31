const fs = require('fs');
const path = require('path');

console.log('\n🧹 REMOVENDO EVENTOS DESNECESSÁRIOS...\n');

const projectRoot = __dirname;

// Arquivos a modificar
const files = [
  {
    path: 'src/utils/ga4Tracking.ts',
    name: 'ga4Tracking.ts',
    removals: [
      /videoButtonUnlocked:\s*\([^)]*\)\s*=>\s*{[^}]*},?\s*/g,
      /spotsUpdated:\s*\([^)]*\)\s*=>\s*{[^}]*},?\s*/g,
      /landingScrollDepth:\s*\([^)]*\)\s*=>\s*{[^}]*},?\s*/g
    ]
  },
  {
    path: 'src/components/Landing.tsx',
    name: 'Landing.tsx',
    removals: [
      /ga4Tracking\.landingScrollDepth\([^)]*\);\s*/g,
      /const scrollObserver[\s\S]*?scrollObserver\.disconnect\(\);\s*}\s*},\s*\{\s*threshold:\s*0\.5\s*}\s*\);\s*/g
    ]
  },
  {
    path: 'src/components/Result.tsx',
    name: 'Result.tsx',
    removals: [
      /ga4Tracking\.videoButtonUnlocked\([^)]*\);\s*/g,
      /ga4Tracking\.spotsUpdated\([^)]*\);\s*/g
    ]
  }
];

// Criar backup
const backupDir = path.join(projectRoot, 'backup', 'events-cleanup-' + new Date().toISOString().replace(/:/g, '-').split('.')[0]);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('📂 Criando backup...');

files.forEach(file => {
  const filePath = path.join(projectRoot, file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file.name}: Arquivo não encontrado`);
    return;
  }

  // Backup
  const backupPath = path.join(backupDir, file.name + '.backup');
  fs.copyFileSync(filePath, backupPath);

  // Ler conteúdo
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Aplicar remoções
  file.removals.forEach(regex => {
    const before = content;
    content = content.replace(regex, '');
    if (before !== content) {
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file.name}: Eventos removidos`);
  } else {
    console.log(`ℹ️  ${file.name}: Nenhuma modificação necessária`);
  }
});

console.log(`\n✅ Backup criado: ${backupDir}`);
console.log('\n🎯 EVENTOS REMOVIDOS:\n');
console.log('  ❌ video_button_unlocked');
console.log('  ❌ spots_updated');
console.log('  ❌ scroll_depth (landingScrollDepth)');
console.log('\n✅ LIMPEZA CONCLUÍDA!\n');
console.log('🎯 PRÓXIMOS PASSOS:\n');
console.log('  1. Execute: npm run dev');
console.log('  2. Teste o funil completo');
console.log('  3. Verifique console (não deve ter mais esses eventos)');
console.log('  4. Se tudo OK, prossiga para instalação do GTM\n');