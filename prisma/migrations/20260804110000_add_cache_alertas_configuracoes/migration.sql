-- CreateTable
CREATE TABLE `OfertaCache` (
    `id` INTEGER NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `modeloBase` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `condicao` VARCHAR(191) NOT NULL,
    `cor` VARCHAR(191) NOT NULL,
    `variante` VARCHAR(191) NULL,
    `armazenamento` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NULL,
    `valor` VARCHAR(191) NOT NULL,
    `valorNum` DECIMAL(12, 2) NOT NULL,
    `fotoUrl` TEXT NOT NULL,
    `dataAtualizacao` VARCHAR(191) NOT NULL,
    `createdAtOrigem` DATETIME(3) NULL,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `atualizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OfertaCache_categoria_idx`(`categoria`),
    INDEX `OfertaCache_modeloBase_idx`(`modeloBase`),
    INDEX `OfertaCache_condicao_idx`(`condicao`),
    INDEX `OfertaCache_armazenamento_idx`(`armazenamento`),
    INDEX `OfertaCache_estado_cidade_idx`(`estado`, `cidade`),
    INDEX `OfertaCache_valorNum_idx`(`valorNum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CacheControle` (
    `chave` VARCHAR(64) NOT NULL,
    `atualizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` INTEGER NOT NULL DEFAULT 0,
    `cidades` INTEGER NOT NULL DEFAULT 0,
    `fornecedores` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlertaPreco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `categoria` VARCHAR(191) NULL,
    `modeloBusca` VARCHAR(191) NULL,
    `condicaoDesejada` VARCHAR(191) NULL,
    `precoAlvo` DECIMAL(12, 2) NOT NULL,
    `canalEmail` BOOLEAN NOT NULL DEFAULT true,
    `canalTelegram` BOOLEAN NOT NULL DEFAULT false,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `ultimoDisparoEm` DATETIME(3) NULL,

    INDEX `AlertaPreco_userId_ativo_idx`(`userId`, `ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlertaDisparo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alertaId` INTEGER NOT NULL,
    `ofertaId` INTEGER NOT NULL,
    `canal` VARCHAR(16) NOT NULL,
    `status` VARCHAR(16) NOT NULL,
    `erro` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enviadoEm` DATETIME(3) NULL,

    INDEX `AlertaDisparo_status_criadoEm_idx`(`status`, `criadoEm`),
    UNIQUE INDEX `AlertaDisparo_alertaId_ofertaId_canal_key`(`alertaId`, `ofertaId`, `canal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TelegramVinculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `chatId` VARCHAR(64) NULL,
    `username` VARCHAR(191) NULL,
    `codigo` VARCHAR(64) NULL,
    `codigoExpiraEm` DATETIME(3) NULL,
    `vinculadoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TelegramVinculo_userId_key`(`userId`),
    UNIQUE INDEX `TelegramVinculo_chatId_key`(`chatId`),
    UNIQUE INDEX `TelegramVinculo_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreferenciaBusca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `visualizacaoPadrao` VARCHAR(16) NOT NULL DEFAULT 'lista',
    `itensPorPagina` INTEGER NOT NULL DEFAULT 25,
    `categoriaPadrao` VARCHAR(191) NOT NULL DEFAULT 'iphone',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PreferenciaBusca_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AlertaPreco` ADD CONSTRAINT `AlertaPreco_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertaDisparo` ADD CONSTRAINT `AlertaDisparo_alertaId_fkey` FOREIGN KEY (`alertaId`) REFERENCES `AlertaPreco`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TelegramVinculo` ADD CONSTRAINT `TelegramVinculo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreferenciaBusca` ADD CONSTRAINT `PreferenciaBusca_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
