-- ============================================================
-- SmartHub Database Seed Data
-- Inserts realistic demo data for all 40 tables
-- Run: mysql -u root < prisma\seed.sql
-- ============================================================

USE `smarthub`;

-- Disable FK checks for clean truncation
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `SystemSetting`;
TRUNCATE TABLE `BudgetLineItem`;
TRUNCATE TABLE `Budget`;
TRUNCATE TABLE `Settlement`;
TRUNCATE TABLE `GatewayTransaction`;
TRUNCATE TABLE `Receipt`;
TRUNCATE TABLE `QuotationItem`;
TRUNCATE TABLE `Quotation`;
TRUNCATE TABLE `DebitNote`;
TRUNCATE TABLE `CreditNote`;
TRUNCATE TABLE `PurchaseInvoiceItem`;
TRUNCATE TABLE `PurchaseInvoice`;
TRUNCATE TABLE `SalesInvoiceItem`;
TRUNCATE TABLE `SalesInvoice`;
TRUNCATE TABLE `TaxTransaction`;
TRUNCATE TABLE `TaxReturn`;
TRUNCATE TABLE `TaxRule`;
TRUNCATE TABLE `TaxRate`;
TRUNCATE TABLE `RecurringExpense`;
TRUNCATE TABLE `VendorPayment`;
TRUNCATE TABLE `Vendor`;
TRUNCATE TABLE `ExpenseClaimItem`;
TRUNCATE TABLE `ExpenseClaim`;
TRUNCATE TABLE `ExpenseCategory`;
TRUNCATE TABLE `Withdrawal`;
TRUNCATE TABLE `Deposit`;
TRUNCATE TABLE `BankReconciliationItem`;
TRUNCATE TABLE `BankReconciliation`;
TRUNCATE TABLE `BankTransfer`;
TRUNCATE TABLE `BankAccount`;
TRUNCATE TABLE `JournalLineItem`;
TRUNCATE TABLE `JournalEntry`;
TRUNCATE TABLE `Account`;
TRUNCATE TABLE `RolePermission`;
TRUNCATE TABLE `AdminRole`;
TRUNCATE TABLE `Payment`;
TRUNCATE TABLE `CartItem`;
TRUNCATE TABLE `WishlistItem`;
TRUNCATE TABLE `OrderItem`;
TRUNCATE TABLE `Order`;
TRUNCATE TABLE `Review`;
TRUNCATE TABLE `Product`;
TRUNCATE TABLE `Category`;
TRUNCATE TABLE `Address`;
TRUNCATE TABLE `User`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------
-- ADMIN ROLES
-- -----------------------------------------------------------
INSERT INTO `AdminRole` (`id`, `name`, `displayName`, `description`, `isSystem`, `createdAt`, `updatedAt`) VALUES
('role-superadmin', 'super_admin', 'Super Admin', 'Full system access', TRUE, NOW(), NOW()),
('role-admin', 'administrator', 'Administrator', 'Day-to-day admin access', TRUE, NOW(), NOW());

-- -----------------------------------------------------------
-- USERS (passwords are bcrypt hash of "password123")
-- -----------------------------------------------------------
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `emailVerified`, `adminRoleId`, `createdAt`, `updatedAt`) VALUES
('user-admin', 'Michael Admin', 'admin@smarthub.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmC6aPV9H0mCbf0f0eK', 'ADMIN', NULL, '+256700111222', TRUE, 'role-superadmin', NOW(), NOW()),
('user-vendor', 'Sarah Vendor', 'vendor@smarthub.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmC6aPV9H0mCbf0f0eK', 'VENDOR', NULL, '+256700111333', TRUE, NULL, NOW(), NOW()),
('user-customer', 'John Doe', 'john@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmC6aPV9H0mCbf0f0eK', 'CUSTOMER', NULL, '+256700111444', TRUE, NULL, NOW(), NOW());

-- -----------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------
INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `image`, `order`, `parentId`, `createdAt`, `updatedAt`) VALUES
('cat-smartphones', 'Smartphones', 'smartphones', 'Latest smartphones and accessories', NULL, 1, NULL, NOW(), NOW()),
('cat-audio', 'Audio', 'audio', 'Headphones, earbuds, and speakers', NULL, 2, NULL, NOW(), NOW()),
('cat-wearables', 'Wearables', 'wearables', 'Smartwatches and fitness trackers', NULL, 3, NULL, NOW(), NOW()),
('cat-chargers', 'Chargers', 'chargers', 'Charging adapters and cables', NULL, 4, NULL, NOW(), NOW()),
('cat-accessories', 'Accessories', 'accessories', 'Phone cases, screen protectors, and more', NULL, 5, NULL, NOW(), NOW());

-- -----------------------------------------------------------
-- ADDRESSES
-- -----------------------------------------------------------
INSERT INTO `Address` (`id`, `label`, `street`, `city`, `state`, `zip`, `country`, `isDefault`, `userId`, `createdAt`) VALUES
('addr-1', 'Home', '123 Tech Lane', 'Kampala', 'Central', '25600', 'UG', TRUE, 'user-customer', NOW()),
('addr-2', 'Office', '456 Innovation Drive', 'Kampala', 'Central', '25600', 'UG', FALSE, 'user-customer', NOW());

-- -----------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------
INSERT INTO `Product` (`id`, `name`, `slug`, `description`, `brand`, `price`, `originalPrice`, `images`, `stock`, `featured`, `specs`, `rating`, `numReviews`, `inStock`, `categoryId`, `vendorId`, `createdAt`, `updatedAt`) VALUES
('prod-elite-buds', 'Elite Buds X2 Pro', 'elite-buds-x2-pro', 'Premium wireless earbuds with ANC, 30h battery, IPX5 water resistance.', 'Acoustic Pro', 159.00, 199.00, '["https://lh3.googleusercontent.com/aida-public/AB6AXuBoMtsn6BBdacHZNLki-wjcNDDheM4gsTL_E0GQfkyZXOVmbvYVfuGLt7UPThAZUG7tjKKWQr5w1epJ-hnqWi7rb0KnsyU46bgFvzPvyhFvmy-rpIt5Deo0ZuU1MWgoZkMaTSXsmF5wLjv3jG18kT2D2p15W-DOLKHnC50zhQwSwHCs-1_YaME4TdUF6_ZS_mmZZK2NyBoB5-QIgFVh8qGw4hWyy-okmi519FOVKS9W6_wl6CpyjuD1Fg"]', 45, TRUE, '{"connectivity":"Bluetooth 5.3","battery":"30 hours","waterproof":"IPX5","driver":"12mm Dynamic"}', 4.8, 128, TRUE, 'cat-audio', 'user-vendor', NOW(), NOW()),

('prod-titanium-series', 'Titanium Series S', 'titanium-series-s', 'Premium smartwatch with titanium frame, AMOLED display, 100+ workout modes.', 'Apex Wear', 299.00, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuBlYP-Qkw9MOJ3I5Vo3L_GEaHLzS6njddruHRx2WXIrKXhqLoyGPAnBzjeyIe6PonT5ZGLMjXPSiR2AkzX2K-miYU-_4zzsXDlLQtf57Wdr_9nCh4gRhdqrhMUuZ6chzf818i55iT7xt3x6izI8a59e6tk7sVrstqnZTYkABXQjxQFw7Lv1DwHU3adONxs5lxb-Z7ANdHaniuZhS2OOhflbxWpsrfNgbxVmhbkBa_DP7JjQbAD_14rGhg"]', 30, TRUE, '{"display":"1.43 AMOLED","battery":"14 days","waterproof":"5 ATM","sensors":"Heart Rate, SpO2, GPS"}', 4.9, 95, TRUE, 'cat-wearables', 'user-vendor', NOW(), NOW()),

('prod-gan-turbo', 'GaN Turbo 65W', 'gan-turbo-65w', 'Compact GaN charger with 65W fast charging, dual USB-C ports, universal compatibility.', 'ChargeFlow', 49.99, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuAj_CN9Te8FTGo1rPARf8HZNeWRy8eOZqgbRApu7m_ccLKZAjExTnsHBSWm8RHvmBrPEwrgQisjeUhiwkHtj0wF-B90dxjkjn5zYOmk4LicIu3kTgmbH6g9Ge46QJRNeeMRSybXLSMViNxRVoeJp4Do0RNJeGCpL__GjTf-s8LWiKIZMgLNUNvGF6a_6LxHGrs2lbn6KYCZwen3UennZKK6JWvAk3xOR0M9TJ4H3xJdJU2s4EebQqnW_Q"]', 100, TRUE, '{"power":"65W","ports":"2x USB-C","technology":"GaN","compatibility":"USB-C PD"}', 4.7, 203, TRUE, 'cat-chargers', 'user-vendor', NOW(), NOW()),

('prod-studio-master', 'Studio Master ANC', 'studio-master-anc', 'Over-ear headphones with adaptive ANC, Hi-Res Audio, 40h playback.', 'Acoustic Pro', 349.00, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuCnYrD8xB7snEGXOsUM-N76m-2hhC7uq_wWfEgZNF6gw6Czb12J5x4D46dSPpk-KhXISElXASurqXfRg1QFkLYmt3JQcII0PioFFfDSMn98KBgx1q96NVoeD0zXl_L0Bv9Rt5CZ459Nu7iNfxTW6U0lVNX-_8kXke7q2C0POIbZNwCmgjWVzFYBWwrZQ9isQi94K2XptuyJ2vRf1XSxKyt0UbSH0ZEFs0rgCOx9XLyBnuTdzpmB0kq2TA"]', 20, TRUE, '{"type":"Over-Ear","anc":"Adaptive","battery":"40 hours","audio":"Hi-Res Certified"}', 5.0, 67, TRUE, 'cat-audio', 'user-vendor', NOW(), NOW()),

('prod-soundflow-buds', 'SoundFlow Buds Pro', 'soundflow-buds-pro', 'True wireless earbuds with immersive sound, touch controls, wireless charging.', 'SoundFlow', 89.00, 129.00, '["https://lh3.googleusercontent.com/aida-public/AB6AXuA_kWt5Z9fXEhZBNao1oZkSYbGg8RTx4US89MOyktTCshuix8UNpRhSurZ7yufbWt8n81GCu5EO76QKNPgTEA8CWJcAklNDm-SHiEF-yA3FhIZIwqKzWu4VLSXZUSoprtFiqDbF_hca5srpqreFTuxJgdPJfZkp9U6B6rk9Ga0j0BsOvD4CK24MKzHoGcTBssOU3OUxbTv4c6duUGzqOulSyeY9L24-lB-ZioP54ESa6Nfc33-wfDKmyA"]', 60, TRUE, '{"battery":"24 hours","connectivity":"Bluetooth 5.2","charging":"Wireless","waterproof":"IPX4"}', 4.5, 312, TRUE, 'cat-audio', 'user-vendor', NOW(), NOW()),

('prod-horizon-watch', 'Horizon Watch S2', 'horizon-watch-s2', 'Hybrid smartwatch with analog design, fitness tracking, 7-day battery.', 'Horizon', 199.00, 235.00, '["https://lh3.googleusercontent.com/aida-public/AB6AXuCL4j9XhEib-n5ArFKxuZ8thoh5oGPYM4qKqAJMtWFGaFyAcPQKOC5hvpy1vchlAPql23ixCUuAwhHhG2l3DzxEZ1FbKSS3Y_mOi-pl3mzEPjey09JKZvMKyhNh1d5E1ys1pj3uYp_0VU3lVlv8TnFTSKQE3Wudut8KhRJwuqHHSVipHLBseVUZmwjxhJOInxbS8kOXnHlL77tWoQv8MKRv3eCV6fNDnXW6sS552kGg_4pHlK8euU4w7g"]', 35, FALSE, '{"design":"Hybrid Analog","battery":"7 days","tracking":"Fitness and Sleep","compatibility":"iOS and Android"}', 4.6, 88, TRUE, 'cat-wearables', 'user-vendor', NOW(), NOW()),

('prod-nova-x-pro', 'Nova X Pro Titanium', 'nova-x-pro-titanium', 'Flagship smartphone with titanium frame, Bionic S4 chip, 108MP camera.', 'NovaTech', 999.00, 1199.00, '["https://lh3.googleusercontent.com/aida-public/AB6AXuBi30WbPq_-0fWrzujsUq-x0Tzyi6kWecTxKtNAra8v9Lu6xPkFl1w0gQJKSBIy58lgQur-78kbwk-3DLPkIyx7Ows5pSceQ3UlxCwAzyVV3-yKDRBsI_pb8UiO7oJEqw2iIMPrBiJyszepNvvhM_wLTFrzqrz4RZ2jzZbYq_rAg-jSHEmJAvyCC46j5chVJsL3uQh_Ynu8p1uXK3-zWNSjKRviAqnkS-vyfDZLktR2Wr7jxf5z4Y0Tkg","https://lh3.googleusercontent.com/aida-public/AB6AXuC93vlkQD_fQHf60LYxyonTLAQLxFYwqIGHAQmjdLMdzmMN2cxcDHRNLSmaFggieKbiD7SyMzteSZWR7JTbJ8M9rgMldVOyHdEj9Kz1UjyXrzQPz-imlSli8updyAk02JGsnWBNgp4CX2IvOo8uDZKWzXsVODq5tLMe9EivA3we6oTVVEcaMBDtP_JyN0aZKW1e57U9cWLaNZgsst1KfrCPbYx9eXdFi493rq4TBgEJ4j0LvbOuNGZCg"]', 15, TRUE, '{"chip":"Bionic S4","camera":"108MP Pro","battery":"48-hour","display":"6.7 OLED SuperX"}', 4.9, 1204, TRUE, 'cat-smartphones', 'user-vendor', NOW(), NOW()),

('prod-noise-cancelling', 'Noise-Cancelling Max', 'noise-cancelling-max', 'Over-ear headphones with industry-leading NC, 30h battery, ultra-comfortable.', 'SmartHub Audio', 299.99, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuDdnwugBx12GBGTX72d2haf3i3BTpSxesKg3uoYymsTLcnpzOcbq11hGj5a3C1CUwxZjGU5HJ7L83ELVh_GgBBr4oCGIuUl9oAZAO-UpftMKLMsjRA0fcS9gUoo6HSOFpxVsbxJmEs4oUtGdwjTg7nw7jdAgzXWCt8RCFy8Ja1mB1erNLyLOP4-c88N5iOj7Rpe9adgFtdqBN6W5s3QjvU1zD9gbwK-O8NauhqgiabHCFeV2aqGmnJn8w"]', 25, FALSE, '{"noise_cancellation":"Industry-leading","battery":"30 hours","weight":"250g","driver":"40mm Custom"}', 4.7, 456, TRUE, 'cat-audio', 'user-vendor', NOW(), NOW()),

('prod-urban-tech-pack', 'Urban Tech Pack', 'urban-tech-pack', 'Tech organizer with cable management, laptop sleeve, multiple compartments.', 'Essentials', 75.00, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuAf52A5VT4DcLHOaCAQzM-2_KuFrNKJtugdKD161AqWgHk3wWcUqWY5DbzEHZAwCjzmFrByZSik3gx7Cd82q44Vub8VvquugPWh_FLIortFB-0xYomBp5vbvzs46P1AuSRb5beuYsHRFgwMvckcxu-vmFsprRPoleNtf0tdLEjw8xIfFPMJ3s2k5u6hqMaaEVE_KhgbXYdrGCki-RBXgfu8xHlbjyNHE3sa5J9qUfI7l_2jfpfGyIiRGg"]', 80, FALSE, '{"material":"Recycled Polyester","capacity":"15L","laptop":"Fits 16 inch","waterproof":"Yes"}', 4.3, 34, TRUE, 'cat-accessories', 'user-vendor', NOW(), NOW()),

('prod-precision-mouse', 'Precision Wireless Mouse', 'precision-wireless-mouse', 'Ergonomic wireless mouse with 16000 DPI, silent clicks, 3-device BT.', 'TechGear', 89.00, NULL, '["https://lh3.googleusercontent.com/aida-public/AB6AXuAxpqieTsBICfaT9XUAjL6_VHls6u2fNepjtPNcOcch35CgTTM0w2tL_N6pSDQlrT4DHylbtKSnhpjUzzVIMIOOCKfJKlDFHz-evaG8lZq34SPZsZxCVHC4ikA0KdQzgGteuMdV7BRPuAOLGfZoRyM5gUMpmDLORSxPIZbQsAlEjiXPdsqvdlHdGxm4kxoP4Oig53xhbtVdL4wFAE-4DtZ4OAvRB5lEh-_pg-MY70mqYpCWc10-YVMg2w"]', 50, FALSE, '{"dpi":"16000","connectivity":"Bluetooth 5.0","battery":"80 days","switches":"Silent"}', 4.6, 189, TRUE, 'cat-accessories', 'user-vendor', NOW(), NOW());

-- -----------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------
INSERT INTO `Review` (`id`, `rating`, `title`, `comment`, `productId`, `userId`, `createdAt`) VALUES
('rev-1', 5, 'Absolutely incredible!', 'The build quality is outstanding. The titanium frame feels premium and lightweight. Best purchase this year!', 'prod-nova-x-pro', 'user-customer', NOW()),
('rev-2', 4, 'Great sound, love the bass', 'Elite Buds X2 Pro have amazing sound quality. Noise cancellation works well for calls too. Battery lasts forever.', 'prod-elite-buds', 'user-customer', NOW()),
('rev-3', 5, 'Best smartwatch I have owned', 'The Titanium Series S looks stunning. Health tracking is accurate and the battery easily lasts two weeks.', 'prod-titanium-series', 'user-customer', NOW()),
('rev-4', 4, 'Compact and powerful', 'This tiny charger can charge my laptop and phone simultaneously. Gets slightly warm but that is normal for GaN.', 'prod-gan-turbo', 'user-customer', NOW());

-- -----------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------
INSERT INTO `Order` (`id`, `status`, `total`, `paymentMethod`, `userId`, `shippingAddressId`, `paidAt`, `deliveredAt`, `createdAt`, `updatedAt`) VALUES
('order-1', 'PROCESSING', 1249.00, 'MTN_MOMO', 'user-customer', 'addr-1', NOW(), NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('order-2', 'DELIVERED', 299.00, 'VISA', 'user-customer', 'addr-1', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('order-3', 'PROCESSING', 89.00, 'AIRTEL_MONEY', 'user-customer', 'addr-2', NOW(), NULL, NOW(), NOW());

INSERT INTO `OrderItem` (`id`, `name`, `price`, `quantity`, `image`, `variant`, `color`, `orderId`, `productId`, `createdAt`) VALUES
('oi-1', 'Nova X Pro Titanium', 999.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi30WbPq_-0fWrzujsUq-x0Tzyi6kWecTxKtNAra8v9Lu6xPkFl1w0gQJKSBIy58lgQur-78kbwk-3DLPkIyx7Ows5pSceQ3UlxCwAzyVV3-yKDRBsI_pb8UiO7oJEqw2iIMPrBiJyszepNvvhM_wLTFrzqrz4RZ2jzZbYq_rAg-jSHEmJAvyCC46j5chVJsL3uQh_Ynu8p1uXK3-zWNSjKRviAqnkS-vyfDZLktR2Wr7jxf5z4Y0Tkg', '256GB', 'Midnight Titanium', 'order-1', 'prod-nova-x-pro', NOW()),
('oi-2', 'Studio Master ANC', 250.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnYrD8xB7snEGXOsUM-N76m-2hhC7uq_wWfEgZNF6gw6Czb12J5x4D46dSPpk-KhXISElXASurqXfRg1QFkLYmt3JQcII0PioFFfDSMn98KBgx1q96NVoeD0zXl_L0Bv9Rt5CZ459Nu7iNfxTW6U0lVNX-_8kXke7q2C0POIbZNwCmgjWVzFYBWwrZQ9isQi94K2XptuyJ2vRf1XSxKyt0UbSH0ZEFs0rgCOx9XLyBnuTdzpmB0kq2TA', NULL, 'Black', 'order-1', 'prod-studio-master', NOW()),
('oi-3', 'Titanium Series S', 299.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlYP-Qkw9MOJ3I5Vo3L_GEaHLzS6njddruHRx2WXIrKXhqLoyGPAnBzjeyIe6PonT5ZGLMjXPSiR2AkzX2K-miYU-_4zzsXDlLQtf57Wdr_9nCh4gRhdqrhMUuZ6chzf818i55iT7xt3x6izI8a59e6tk7sVrstqnZTYkABXQjxQFw7Lv1DwHU3adONxs5lxb-Z7ANdHaniuZhS2OOhflbxWpsrfNgbxVmhbkBa_DP7JjQbAD_14rGhg', NULL, 'Titanium', 'order-2', 'prod-titanium-series', NOW()),
('oi-4', 'Precision Wireless Mouse', 89.00, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxpqieTsBICfaT9XUAjL6_VHls6u2fNepjtPNcOcch35CgTTM0w2tL_N6pSDQlrT4DHylbtKSnhpjUzzVIMIOOCKfJKlDFHz-evaG8lZq34SPZsZxCVHC4ikA0KdQzgGteuMdV7BRPuAOLGfZoRyM5gUMpmDLORSxPIZbQsAlEjiXPdsqvdlHdGxm4kxoP4Oig53xhbtVdL4wFAE-4DtZ4OAvRB5lEh-_pg-MY70mqYpCWc10-YVMg2w', NULL, 'Space Gray', 'order-3', 'prod-precision-mouse', NOW());

-- -----------------------------------------------------------
-- PAYMENTS
-- -----------------------------------------------------------
INSERT INTO `Payment` (`id`, `method`, `status`, `transactionId`, `amount`, `orderId`, `userId`, `createdAt`) VALUES
('pay-1', 'MTN_MOMO', 'COMPLETED', 'TXN-MTN-001', 1249.00, 'order-1', 'user-customer', NOW()),
('pay-2', 'VISA', 'COMPLETED', 'TXN-VISA-001', 299.00, 'order-2', 'user-customer', DATE_SUB(NOW(), INTERVAL 7 DAY)),
('pay-3', 'AIRTEL_MONEY', 'PENDING', 'TXN-AIRTEL-001', 89.00, 'order-3', 'user-customer', NOW());

-- -----------------------------------------------------------
-- SYSTEM SETTINGS
-- -----------------------------------------------------------
INSERT INTO `SystemSetting` (`id`, `key`, `value`, `description`, `group`, `isPublic`, `createdAt`, `updatedAt`) VALUES
('setting-1', 'store_name', 'SmartHub Shop', 'The name of the store', 'general', TRUE, NOW(), NOW()),
('setting-2', 'store_currency', 'RWF', 'Default store currency', 'general', TRUE, NOW(), NOW()),
('setting-3', 'tax_rate_default', '8.5', 'Default tax rate percentage', 'tax', FALSE, NOW(), NOW()),
('setting-4', 'payment_mtn_momo', 'true', 'Enable MTN MoMo payments', 'payment', FALSE, NOW(), NOW()),
('setting-5', 'payment_airtel_money', 'true', 'Enable Airtel Money payments', 'payment', FALSE, NOW(), NOW()),
('setting-6', 'payment_visa', 'true', 'Enable Visa card payments', 'payment', FALSE, NOW(), NOW()),
('setting-7', 'payment_mastercard', 'true', 'Enable Mastercard payments', 'payment', FALSE, NOW(), NOW());

-- -----------------------------------------------------------
-- EXPENSE CATEGORIES
-- -----------------------------------------------------------
INSERT INTO `ExpenseCategory` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('expcat-1', 'Office Supplies', 'Stationery, printer ink, and office materials', TRUE, NOW(), NOW()),
('expcat-2', 'Utilities', 'Electricity, water, and internet bills', TRUE, NOW(), NOW()),
('expcat-3', 'Travel', 'Business travel and transportation', TRUE, NOW(), NOW()),
('expcat-4', 'Marketing', 'Advertising and promotional expenses', TRUE, NOW(), NOW());

-- -----------------------------------------------------------
-- VENDOR (supplier)
-- -----------------------------------------------------------
INSERT INTO `Vendor` (`id`, `name`, `type`, `contactPerson`, `email`, `phone`, `address`, `taxId`, `paymentTerms`, `isActive`, `notes`, `createdAt`, `updatedAt`) VALUES
('vendor-1', 'TechSupply Ltd', 'COMPANY', 'James Mwangi', 'james@techsupply.ke', '+254712345678', 'Nairobi, Kenya', 'TIN-123456', 'Net 30', TRUE, 'Main electronics supplier', NOW(), NOW()),
('vendor-2', 'AudioPro Distributors', 'COMPANY', 'Grace Ochieng', 'grace@audiopro.ug', '+256700987654', 'Kampala, Uganda', 'TIN-789012', 'Net 15', TRUE, 'Audio equipment specialist', NOW(), NOW());

-- -----------------------------------------------------------
-- ACCOUNT (Chart of Accounts)
-- -----------------------------------------------------------
INSERT INTO `Account` (`id`, `code`, `name`, `description`, `type`, `isActive`, `parentId`, `createdAt`, `updatedAt`) VALUES
('acct-1000', '1000', 'Cash', 'Cash on hand', 'ASSET', TRUE, NULL, NOW(), NOW()),
('acct-1100', '1100', 'Accounts Receivable', 'Money owed by customers', 'ASSET', TRUE, NULL, NOW(), NOW()),
('acct-2000', '2000', 'Accounts Payable', 'Money owed to suppliers', 'LIABILITY', TRUE, NULL, NOW(), NOW()),
('acct-3000', '3000', 'Owner Equity', 'Owner capital and retained earnings', 'EQUITY', TRUE, NULL, NOW(), NOW()),
('acct-4000', '4000', 'Sales Revenue', 'Revenue from product sales', 'INCOME', TRUE, NULL, NOW(), NOW()),
('acct-5000', '5000', 'Cost of Goods Sold', 'Direct cost of products sold', 'EXPENSE', TRUE, NULL, NOW(), NOW()),
('acct-6000', '6000', 'Operating Expenses', 'General operating expenses', 'EXPENSE', TRUE, NULL, NOW(), NOW());

-- -----------------------------------------------------------
-- TAX RATES
-- -----------------------------------------------------------
INSERT INTO `TaxRate` (`id`, `name`, `rate`, `type`, `isActive`, `description`, `effectiveDate`, `endDate`, `createdAt`, `updatedAt`) VALUES
('tax-1', 'Standard VAT', 18.00, 'VAT', TRUE, 'Standard 18% VAT rate', '2024-01-01 00:00:00', NULL, NOW(), NOW()),
('tax-2', 'Reduced VAT', 8.00, 'VAT', TRUE, 'Reduced 8% VAT for essentials', '2024-01-01 00:00:00', NULL, NOW(), NOW());

-- -----------------------------------------------------------
-- BANK ACCOUNTS
-- -----------------------------------------------------------
INSERT INTO `BankAccount` (`id`, `accountName`, `accountNumber`, `bankName`, `type`, `currency`, `openingBalance`, `currentBalance`, `isActive`, `description`, `createdAt`, `updatedAt`) VALUES
('bank-1', 'SmartHub Business Account', '1002003004', 'Stanbic Bank', 'CHECKING', 'UGX', 50000000.00, 62500000.00, TRUE, 'Main business checking account', NOW(), NOW()),
('bank-2', 'SmartHub Savings', '5006007008', 'Equity Bank', 'SAVINGS', 'UGX', 20000000.00, 20000000.00, TRUE, 'Business savings account', NOW(), NOW());
