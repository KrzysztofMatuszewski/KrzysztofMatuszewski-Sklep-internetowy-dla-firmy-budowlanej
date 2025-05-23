--@block
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `roleId` INT NOT NULL,
    `isverified` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(`id`)
);

CREATE TABLE `roles` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE `categories` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE `products` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `sellPrice` DECIMAL(10,2) NOT NULL,
    `buyPrice` DECIMAL(10,2) NOT NULL,
    `categoryId` INT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`categoryId`) REFERENCES `categories`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE `orders` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `userId` INT NOT NULL,
    `totalPrice` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `status` ENUM("pending", "completed", "canceled") NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userId`) REFERENCES `users`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `orderItems` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `orderId` INT NOT NULL,
    `productId` INT NOT NULL,
    `quantity` INT NOT NULL,
    `buyPrice` DECIMAL(10,2) NOT NULL,
    `sellPrice` DECIMAL(10,2) NOT NULL,
    `totalSellPrice` DECIMAL(10,2) NOT NULL COMMENT 'iloczyn sellPrice i quantity',
    `totalBuyPrice` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`orderId`) REFERENCES `orders`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(`productId`) REFERENCES `products`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE `forumPosts` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `userId` INT NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userId`) REFERENCES `users`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `reviews` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `userId` INT NOT NULL,
    `productId` INT NOT NULL,
    `rating` INT NOT NULL CHECK(`rating` BETWEEN 1 AND 5),
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userId`) REFERENCES `users`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(`productId`) REFERENCES `products`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `productImages` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `productId` INT NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `imageData` BLOB NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`productId`) REFERENCES `products`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `productFiles` (
    `id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `productId` INT NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `fileData` BLOB NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`productId`) REFERENCES `products`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE `users`
ADD FOREIGN KEY(`roleId`) REFERENCES `roles`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

--@block
-- Role użytkowników
INSERT INTO roles (id, name) 
VALUES
(1, 'admin');



-- @block
-- Użytkownicy (hasło 'password123' zahashowane)
INSERT INTO users (username, email, password, roleId, isverified) 
VALUES
('admin2', 'admin@patobud.pl', '$2b$12$m9LXXKkfwZHrMX.UaVJn3.xZ85hM0JzMB1dQlBTbGrVhfR0eo5bPC', 1, 1);

-- @block
-- Kategorie produktów
INSERT INTO categories (id, name) 
VALUES
(1, 'Narzędzia');
-- @block
INSERT INTO categories (id, name) 
VALUES
(2, 'Narzędzia2');
-- @block
INSERT INTO categories (id, name) 
VALUES
(3, 'Narzędzia3');

-- @block
-- Produkty
INSERT INTO products (name, description, sellPrice, buyPrice, categoryId, stock) 
VALUES
('Wiertarka udarowa BOSCH GSB 18V-55', 'Profesjonalna wiertarka udarowa BOSCH o napięciu 18V, maksymalnym momencie obrotowym 55 Nm. Doskonała do prac domowych i profesjonalnych. Urządzenie wyposażone w silnik bezszczotkowy, który zapewnia wydajną pracę i dłuższą żywotność narzędzia.', 479.99, 389.99, 1, 24);

-- @block
-- Produkty
INSERT INTO products (name, description, sellPrice, buyPrice, categoryId, stock) 
VALUES
('narzedzie2', 'test', 479.99, 389.99, 2, 24);

-- @block
-- Produkty
INSERT INTO products (name, description, sellPrice, buyPrice, categoryId, stock) 
VALUES
('narzedzie3', 'test', 479.99, 389.99, 3, 24);
-- @block
-- Zamówienia
INSERT INTO orders (userId, totalPrice, status, createdAt) VALUES
(1, 982.48, 'completed', '2024-02-15 10:30:00');

-- @block
-- Elementy zamówień
INSERT INTO orderItems (orderId, productId, quantity, buyPrice, sellPrice, totalSellPrice, totalBuyPrice) VALUES
(1, 3, 1, 389.99, 479.99, 959.98, 779.98);

-- @block
-- Recenzje produktów
INSERT INTO reviews (userId, productId, rating) VALUES
(1, 3, 5);

-- @block
INSERT INTO productImages (productId, filename, imageData) VALUES
(3, 'wiertarka_bosch.jpg', UNHEX('89504E470D0A1A0A0000000D49484452000000100000001008060000001FF3FF610000001974455874536F6674776172650041646F626520496D616765526561647971C9653C000002634944415478DA94534D48545114FEEE7D6FE69F19C78C999419344551D10FA8A845292D5AA45B08222A5744144B4AADBC22D454144B428086A911659A6619241FEFE666C46739AFFB799F7DE79F7DE8A169D550FEE39F7DCF39DF39C736B56A022F0DFAB46BA6E006506BFD66868A0A0E5782E70EBF5DDF17472C5A24C1F72C7CBF4F2DAB73F80E17A50E02A3CD847E8D3020F0502FE5A24AE21FCCD35EDDCBA7FBEAEE4E2F17A0A6C8DF3D44FA1CFE02F03F8BF8F30A8500A7A94A85B1FEFECA57F3827E1F52DA13CCFA8BF2E6007B66C0740AC92BB40C1F2ED2C14F4F7C8F38F600B18D3DD85D8F3D27C5B3ACDBD9A0F37BBF91809FE06D1381E64D3B51FFEA0D42FBB796DA9E54B7F485566B4CA46A4F800220B36A5518DAD2066EF5EAEAA43C9A61B58FCE5158A74BF7EE60F0E63D5E9E598CD0FE9D0BD7B25A21ED723F30601CE0E70EF49A2D4EC68CFC09EF01DEA44BD84C0DCF9D0BAFE80C8B2B5985BB0CE88E85E3D1F5F6116CACB00BA5E7CF208A6DCC7BF4184A8C3FD14ECEA9F8C7A60CCD4A0B33F894FDE5ECC1D3D0D3D3E86A953EC0C60A8AB0F91F2C5D0B84B26CF58A5A84A9DA1DB65B859A49C02883C4DA4F4A5E9EBC4E9A76EE59323BF62FD9AD39ACF18F01F6A51DB9A25A0CE6050F3AE0A86AA21AFF9E05A9E8A6C8AFB5B6B34F5A1D7E6B64C765E77C2663EFF6D24D0DFD5A9E9AE4B9D2FEE5D2DB7DEDA5F5E752F38E26C5E9F36573AEC7E9C9DF02FD09B21CB72614F17FE45A31E44A6D4B3BDCBA2571F9F4975CD54F9975FF01F40D09AE7E84BE670000000049454E44AE426082'));

--@block
INSERT INTO roles (id, name) 
VALUES
(2, 'user');

--@block
ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('pending', 'completed', 'canceled', 'cart') NOT NULL;

--@block
ALTER TABLE reviews
ADD COLUMN title VARCHAR(255),
ADD COLUMN content TEXT,
ADD COLUMN pros TEXT,
ADD COLUMN cons TEXT,
ADD COLUMN helpful_yes INT DEFAULT 0,
ADD COLUMN helpful_no INT DEFAULT 0,
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

--@block
ALTER TABLE reviews
DROP COLUMN pros,
DROP COLUMN cons,
DROP COLUMN helpful_yes,
DROP COLUMN helpful_no;

--@block
SELECT * from reviews;

--@block
UPDATE users SET roleId = 1 WHERE id = 4;

-- -- @block
-- -- Użytkownicy (hasło 'password123' zahashowane)
-- INSERT INTO users (username, email, password, roleId, isverified) 
-- VALUES
-- ('wik', 'wik@patobud.pl', 'wik123', 1, 1);

-- --@block
-- SELECT * from users;

-- --@block
-- DELETE FROM users WHERE username = 'wik';

-- --@block
-- UPDATE users SET roleId = 1 WHERE id = 4;

-- --@block
-- UPDATE users SET isverified = 1 WHERE id = 4;

--@block
ALTER TABLE products
ADD COLUMN lastMovement DATETIME DEFAULT NULL;

--@block
UPDATE products p
LEFT JOIN (
    SELECT oi.productId, MAX(o.createdAt) AS last_movement
    FROM orderItems oi
    JOIN orders o ON oi.orderId = o.id
    GROUP BY oi.productId
) AS lm ON p.id = lm.productId
SET p.lastMovement = lm.last_movement;
