CREATE TABLE `TelegramConversaPublica` (
  `chatId` VARCHAR(64) NOT NULL,
  `username` VARCHAR(191) NULL,
  `contextoBusca` JSON NULL,
  `contextoAtualizadoEm` DATETIME(3) NULL,
  `ultimaMensagemEm` DATETIME(3) NULL,
  `janelaInicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `mensagensNaJanela` INTEGER NOT NULL DEFAULT 0,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  PRIMARY KEY (`chatId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
