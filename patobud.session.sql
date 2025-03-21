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

CCREATE TABLE `orderItems` (
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