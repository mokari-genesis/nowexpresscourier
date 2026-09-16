-- primeDev.account_reconciliation definition

CREATE TABLE `account_reconciliation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `recorded_at` datetime NOT NULL,
  `recorded_by` varchar(25) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL,
  UNIQUE KEY `account_reconciliation_UN` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 736 DEFAULT CHARSET = latin1;
-- primeDev.accounts_receivable definition

CREATE TABLE `accounts_receivable` (
  `package_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `charge` int DEFAULT NULL,
  `remaining` int DEFAULT NULL,
  `client_id` varchar(20) DEFAULT NULL,
  `date` timestamp NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1;
-- primeDev.carriers definition

CREATE TABLE `carriers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ACTIVE',
  `code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  UNIQUE KEY `carrier_UN` (`id`),
  UNIQUE KEY `carriers_UN` (`name`)
) ENGINE = InnoDB AUTO_INCREMENT = 24 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- primeDev.clientes definition

CREATE TABLE `clientes` (
  `client_id` varchar(10) NOT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `invoice_name` varchar(100) DEFAULT NULL,
  `salesman` varchar(50) DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  `main_address` varchar(255) DEFAULT NULL,
  `vip` varchar(3) DEFAULT NULL,
  `entrega` varchar(255) DEFAULT NULL,
  `cuota` varchar(10) DEFAULT NULL,
  `message_user` longtext,
  `message_admin` varchar(200) DEFAULT NULL,
  `preferences` varchar(200) DEFAULT NULL,
  `date_created` varchar(50) DEFAULT NULL,
  `terms_date` varchar(50) DEFAULT NULL,
  `terms_ip` varchar(30) DEFAULT NULL,
  `terms` int DEFAULT NULL,
  `hashed_password` varbinary(150) DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `flete` decimal(10, 2) DEFAULT '25.00',
  `desaduanaje` decimal(10, 2) DEFAULT '30.00',
  `tasa_cambio` decimal(10, 2) DEFAULT '7.80',
  `reference_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`,
`client_id`),
  KEY `client_idx` (`client_id`),
  KEY `clientes_id_usuario_IDX` (`id_usuario`)
    USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 51597 DEFAULT CHARSET = latin1;
-- primeDev.comisiones definition

CREATE TABLE `comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `salesman` varchar(50) DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `package_id` int DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `date_created` date DEFAULT NULL,
  `date_payed` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = MyISAM AUTO_INCREMENT = 57317 DEFAULT CHARSET = latin1;
-- primeDev.destinations definition

CREATE TABLE `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = latin1;
-- primeDev.document_correlative definition

CREATE TABLE `document_correlative` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serie` varchar(100) NOT NULL,
  `init_serie` varchar(100) NOT NULL,
  `end_serie` varchar(100) NOT NULL,
  `type_doc` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `current_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = latin1;
-- primeDev.document_details definition

CREATE TABLE `document_details` (
  `id_document` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `item` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `qty` int NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `descuento` decimal(10, 2) DEFAULT NULL,
  `sub_total` decimal(10, 2) DEFAULT NULL,
  `unitario` decimal(10, 2) DEFAULT NULL,
  `package_id` varchar(100) DEFAULT NULL,
  `cod_service` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,
`id_document`)
) ENGINE = InnoDB AUTO_INCREMENT = 2064 DEFAULT CHARSET = latin1;
-- primeDev.document_status definition

CREATE TABLE `document_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = latin1;
-- primeDev.document_types definition

CREATE TABLE `document_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = latin1;
-- primeDev.documents definition

CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) NOT NULL,
  `nit` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `type_doc` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) NOT NULL,
  `num_serie_sat` varchar(100) DEFAULT NULL,
  `num_authorization_sat` varchar(250) DEFAULT NULL,
  `num_control` varchar(100) NOT NULL,
  `total` decimal(10, 2) NOT NULL,
  `sub_total` decimal(10, 1) NOT NULL,
  `total_cta` decimal(10, 2) NOT NULL,
  `observations` varchar(200) NOT NULL,
  `status` int DEFAULT NULL,
  `transaction_number` int NOT NULL,
  `delivery_date_sat` datetime DEFAULT NULL,
  `certification_date_date` datetime DEFAULT NULL,
  `annulation_date` datetime DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `annul_by` varchar(100) DEFAULT NULL,
  `payment_id` int NOT NULL DEFAULT '1',
  `store_id` int NOT NULL DEFAULT '1',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `seguro` decimal(10, 2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `documents_UN` (`num_control`)
) ENGINE = InnoDB AUTO_INCREMENT = 2327 DEFAULT CHARSET = latin1;
-- primeDev.guides definition

CREATE TABLE `guides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `master` varchar(100) NOT NULL,
  `poliza` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `date_closed` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `master_idx` (`id`,
`master`)
) ENGINE = InnoDB AUTO_INCREMENT = 232 DEFAULT CHARSET = latin1;
-- primeDev.log definition

CREATE TABLE `log` (
  `entity` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `register` varchar(250) NOT NULL,
  `modify_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = latin1;
-- primeDev.log_documents definition

CREATE TABLE `log_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `response_pdf` longtext,
  `request` longtext NOT NULL,
  `error` varchar(250) DEFAULT NULL,
  `response_xml` longtext,
  `response_data` varchar(100) DEFAULT NULL,
  `create_at` datetime NOT NULL,
  `update_at` datetime DEFAULT NULL,
  `document_id` int NOT NULL,
  UNIQUE KEY `log_documents_UN` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 829 DEFAULT CHARSET = latin1;
-- primeDev.logs definition

CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(250) NOT NULL,
  `request` longtext NOT NULL,
  `user` varchar(250) NOT NULL,
  `create_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_id_IDX` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 225 DEFAULT CHARSET = latin1;
-- primeDev.manifest definition

CREATE TABLE `manifest` (
  `manifest_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`manifest_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 71 DEFAULT CHARSET = latin1;
-- primeDev.manifest_load definition

CREATE TABLE `manifest_load` (
  `id` int NOT NULL AUTO_INCREMENT,
  `declaration_number` varchar(100) NOT NULL,
  `master` varchar(100) NOT NULL,
  `declaration_date` varchar(50) DEFAULT NULL,
  `xml_count` int NOT NULL DEFAULT '0',
  `found_count` int NOT NULL DEFAULT '0',
  `updated_count` int NOT NULL DEFAULT '0',
  `not_found_count` int NOT NULL DEFAULT '0',
  `invalid_count` int NOT NULL DEFAULT '0',
  `ambiguous_count` int NOT NULL DEFAULT '0',
  `skipped_count` int NOT NULL DEFAULT '0',
  `status` varchar(30) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `error_message` text,
  `create_at` datetime NOT NULL,
  `tipo_de_cambio` decimal(12, 6) DEFAULT NULL,
  `sub_total` decimal(12, 2) DEFAULT NULL,
  `monto_iva` decimal(12, 2) DEFAULT NULL,
  `monto_total` decimal(12, 2) DEFAULT NULL,
  `resultado_analisis_riesgo` varchar(150) DEFAULT NULL,
  `manifest_id` varchar(100) DEFAULT NULL,
  `manifest_description` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_manifest_load_declaration` (`declaration_number`,
`master`),
  KEY `idx_manifest_load_create_at` (`create_at`)
) ENGINE = InnoDB AUTO_INCREMENT = 45 DEFAULT CHARSET = latin1;
-- primeDev.paquetes definition

CREATE TABLE `paquetes` (
  `package_id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(20) DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `tasa` float DEFAULT NULL,
  `tracking` varchar(255) DEFAULT NULL,
  `description` longtext,
  `status` varchar(50) DEFAULT NULL,
  `importe` float DEFAULT NULL,
  `guia` varchar(255) DEFAULT NULL,
  `cif` float DEFAULT NULL,
  `producto` varchar(255) DEFAULT NULL,
  `dai` float DEFAULT NULL,
  `poliza` varchar(255) DEFAULT NULL,
  `master` varchar(255) NOT NULL,
  `factura` varchar(255) DEFAULT NULL,
  `factura_id` int DEFAULT NULL,
  `vip` varchar(5) DEFAULT '0',
  `delivery` varchar(5) DEFAULT '0',
  `cancelado` varchar(5) DEFAULT '0',
  `entregado` varchar(5) DEFAULT '0',
  `cot_date` varchar(50) DEFAULT NULL,
  `ped_date` varchar(50) DEFAULT NULL,
  `ing_date` varchar(50) DEFAULT NULL,
  `fac_date` varchar(50) DEFAULT NULL,
  `ent_date` varchar(50) DEFAULT '0000-00-00',
  `pag_date` varchar(50) DEFAULT NULL,
  `ant_date` varchar(50) DEFAULT NULL,
  `total_a_pagar` varchar(50) DEFAULT NULL,
  `costo_producto` float DEFAULT NULL,
  `anticipo` varchar(50) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `create_by` varchar(255) DEFAULT NULL,
  `measurements` varchar(255) DEFAULT NULL,
  `pending_amount` int DEFAULT '0',
  `total_iva` decimal(10, 2) DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `carrier_id` int DEFAULT NULL,
  `manifest_id` int DEFAULT NULL,
  `destination_id` int DEFAULT NULL,
  `pieces` int NOT NULL DEFAULT '1',
  `voucher_bill` text,
  `voucher_payment` text,
  `tariff_code` int DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `valor_miami` float DEFAULT NULL,
  `ing_date_gt` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`package_id`),
  UNIQUE KEY `paquetes_UN` (`guia`),
  KEY `client_id` (`client_id`),
  KEY `package_idx` (`package_id`,
`tracking`),
  KEY `paquetes_tariff_code_fk` (`tariff_code`)
) ENGINE = MyISAM AUTO_INCREMENT = 4002 DEFAULT CHARSET = latin1;
-- primeDev.paquetes_detail definition

CREATE TABLE `paquetes_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `status` int DEFAULT NULL,
  `fecha_registro` datetime DEFAULT NULL,
  `client_id` varchar(20) DEFAULT NULL,
  `tba` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3344 DEFAULT CHARSET = latin1;
-- primeDev.payment_types definition

CREATE TABLE `payment_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = latin1;
-- primeDev.products definition

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` varchar(100) NOT NULL DEFAULT 'S',
  `price` decimal(10, 2) NOT NULL,
  `UNIT` varchar(100) NOT NULL DEFAULT 'UNIT',
  `description_sat` varchar(5) NOT NULL,
  UNIQUE KEY `products_UN` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = latin1;
-- primeDev.recibos definition

CREATE TABLE `recibos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total` varchar(50) DEFAULT NULL,
  `mensajero` varchar(255) DEFAULT NULL,
  `date_created` varchar(255) DEFAULT NULL,
  `date_payed` varchar(255) DEFAULT NULL,
  `pack1` varchar(255) DEFAULT NULL,
  `weight_pack1` varchar(255) DEFAULT NULL,
  `pp1` varchar(255) DEFAULT NULL,
  `pack2` varchar(255) DEFAULT NULL,
  `weight_pack2` varchar(255) DEFAULT NULL,
  `pp2` varchar(255) DEFAULT NULL,
  `pack3` varchar(255) DEFAULT NULL,
  `weight_pack3` varchar(255) DEFAULT NULL,
  `pp3` varchar(255) DEFAULT NULL,
  `pack4` varchar(255) DEFAULT NULL,
  `weight_pack4` varchar(255) DEFAULT NULL,
  `pp4` varchar(255) DEFAULT NULL,
  `pack5` varchar(255) DEFAULT NULL,
  `weight_pack5` varchar(255) DEFAULT NULL,
  `pp5` varchar(255) DEFAULT NULL,
  `pack6` varchar(255) DEFAULT NULL,
  `weight_pack6` varchar(255) DEFAULT NULL,
  `pp6` varchar(255) DEFAULT NULL,
  `pack7` varchar(255) DEFAULT NULL,
  `weight_pack7` varchar(255) DEFAULT NULL,
  `pp7` varchar(255) DEFAULT NULL,
  `pack8` varchar(255) DEFAULT NULL,
  `weight_pack8` varchar(255) DEFAULT NULL,
  `pp8` varchar(255) DEFAULT NULL,
  `multi` varchar(255) DEFAULT NULL,
  `guia` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = MyISAM AUTO_INCREMENT = 13573 DEFAULT CHARSET = latin1;
-- primeDev.settings definition

CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;
-- primeDev.stores definition

CREATE TABLE `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'ACTIVE',
  UNIQUE KEY `stores_UN` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = latin1;
-- primeDev.suppliers definition

CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ACTIVE',
  `code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 34 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- primeDev.tariffs definition

CREATE TABLE `tariffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `tasa` float NOT NULL,
  `code` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1673 DEFAULT CHARSET = latin1;
-- primeDev.usuarios definition

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `hashed_password` varbinary(150) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `type` enum('master', 'admin', 'vendedor', 'operador', 'cliente', 'recepcionista', 'warehouse', 'warehousegt', 'warehousemiami', 'asistente') DEFAULT 'vendedor',
  `new_column` int DEFAULT NULL,
  `activo` enum('Y', 'N') DEFAULT 'Y',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 62728 DEFAULT CHARSET = latin1;
-- primeDev.manifest_load_detail definition

CREATE TABLE `manifest_load_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `load_id` int NOT NULL,
  `guia` varchar(50) DEFAULT NULL,
  `package_id` int DEFAULT NULL,
  `description` text,
  `costo_producto` decimal(12, 2) DEFAULT NULL,
  `tariff_code_xml` varchar(50) DEFAULT NULL,
  `tariff_id` int DEFAULT NULL,
  `tasa` decimal(10, 4) DEFAULT NULL,
  `dai` decimal(12, 2) DEFAULT NULL,
  `dai_xml` decimal(12, 2) DEFAULT NULL,
  `result` varchar(30) NOT NULL,
  `error_description` text,
  `previous_costo_producto` decimal(12, 2) DEFAULT NULL,
  `previous_tariff_code` int DEFAULT NULL,
  `previous_tasa` decimal(10, 4) DEFAULT NULL,
  `previous_dai` decimal(12, 2) DEFAULT NULL,
  `create_at` datetime NOT NULL,
  `analisis_riesgo` varchar(20) DEFAULT NULL,
  `manifest_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_manifest_load_detail_load` (`load_id`),
  KEY `idx_manifest_load_detail_package` (`package_id`),
  KEY `idx_manifest_load_detail_guia` (`guia`),
  CONSTRAINT `fk_manifest_load_detail_load` FOREIGN KEY (`load_id`) REFERENCES `manifest_load` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1732 DEFAULT CHARSET = latin1;
